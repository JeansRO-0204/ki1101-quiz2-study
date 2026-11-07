// three.js molecule viewer shared by vsepr / mol-polarity. Atoms = shaded CPK spheres, bonds = cylinders
// (double/triple = several thin ones), lone pairs = translucent lobes, optional ghost polyhedron, angle labels, dipole arrows.
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Layout, V3 } from './geom'
import { polyhedronEdges, cross, norm } from './geom'
import type { DipoleResult, Lig } from './species'

const CPK: Record<string, number> = {
  H: 0xffffff, Be: 0xc2ff00, B: 0xffb5b5, C: 0x909090, N: 0x3050f8, O: 0xff0d0d, F: 0x90e050, Si: 0xf0c8a0, P: 0xff8000, S: 0xffe135,
  Cl: 0x1ff01f, Se: 0xffa100, Br: 0xa62929, Te: 0xd47a00, I: 0x940094, Xe: 0x429eb0, A: 0x6366f1, X: 0x94a3b8,
}
const RAD: Record<string, number> = { H: 0.3, Be: 0.42, B: 0.42, C: 0.42, N: 0.4, O: 0.4, F: 0.38, Si: 0.5, P: 0.5, S: 0.5, Cl: 0.52, Se: 0.55, Br: 0.58, Te: 0.62, I: 0.65, Xe: 0.65, A: 0.52, X: 0.42 }
export const cpkCss = (sym: string) => '#' + (CPK[sym] ?? 0x94a3b8).toString(16).padStart(6, '0')
const BOND_LEN = 1.9

export interface Mol3DProps {
  layout: Layout<Lig>
  centre: string
  showDomains?: boolean
  showLone?: boolean
  showAngles?: boolean
  dipole?: DipoleResult | null
  height?: number
  autoRotate?: boolean
  /** fixed camera tweak key: changing it resets the view */
  resetKey?: string
}

type Disposable = { dispose: () => void }

export default function Mol3D(p: Mol3DProps) {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<{ rebuild: (p: Mol3DProps) => void; reset: () => void } | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const latest = useRef(p)
  latest.current = p

  useEffect(() => {
    const el = host.current
    if (!el) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      setErr('WebGL is not available in this browser.')
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    const dom = renderer.domElement
    dom.style.display = 'block'
    dom.style.width = '100%'
    dom.style.height = '100%'
    dom.style.touchAction = 'none'
    dom.style.cursor = 'grab'
    el.appendChild(dom)

    const scene = new THREE.Scene()
    scene.add(new THREE.AmbientLight(0xffffff, 1.15))
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 6, 5); scene.add(key)
    const fill = new THREE.DirectionalLight(0xbcd0ff, 0.9); fill.position.set(-5, -2, -3); scene.add(fill)
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    const root = new THREE.Group(); scene.add(root)
    let group = new THREE.Group(); root.add(group)
    let owned: Disposable[] = []
    const own = <T extends Disposable>(x: T): T => { owned.push(x); return x }

    /* ----- orbit ----- */
    const view = { theta: 0.65, phi: 1.2, r: 8.2 }
    let spin = true
    let visible = true
    let raf = 0
    let dirty = true
    const placeCamera = () => {
      camera.position.set(view.r * Math.sin(view.phi) * Math.sin(view.theta), view.r * Math.cos(view.phi), view.r * Math.sin(view.phi) * Math.cos(view.theta))
      camera.lookAt(0, 0, 0)
      dirty = true
    }
    const pointers = new Map<number, { x: number; y: number }>()
    let pinch = 0
    const onDown = (e: PointerEvent) => {
      dom.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      dom.style.cursor = 'grabbing'; spin = false
      if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y) }
    }
    const onMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId)
      if (!prev) return
      if (pointers.size === 1) {
        view.theta -= (e.clientX - prev.x) * 0.01
        view.phi = Math.min(Math.PI - 0.12, Math.max(0.12, view.phi - (e.clientY - prev.y) * 0.01))
      }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (pinch > 0) view.r = Math.min(16, Math.max(4, view.r * (pinch / d)))
        pinch = d
      }
      placeCamera()
    }
    const onUp = (e: PointerEvent) => { pointers.delete(e.pointerId); pinch = 0; dom.style.cursor = 'grab' }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); spin = false
      view.r = Math.min(16, Math.max(4, view.r * Math.exp(e.deltaY * 0.001))); placeCamera()
    }
    dom.addEventListener('pointerdown', onDown); dom.addEventListener('pointermove', onMove)
    dom.addEventListener('pointerup', onUp); dom.addEventListener('pointercancel', onUp)
    dom.addEventListener('wheel', onWheel, { passive: false })

    /* ----- resize ----- */
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true
    }
    const ro = new ResizeObserver(resize); ro.observe(el); resize()
    const io = new IntersectionObserver((es) => { visible = es[0]?.isIntersecting ?? true }); io.observe(el)

    /* ----- content ----- */
    const sphere = (pos: V3, r: number, color: number, opts: { opacity?: number; scale?: V3; emissive?: boolean } = {}) => {
      const geo = own(new THREE.SphereGeometry(r, 36, 24))
      const mat = own(new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.05, transparent: opts.opacity != null, opacity: opts.opacity ?? 1 }))
      const m = new THREE.Mesh(geo, mat); m.position.set(...pos)
      if (opts.scale) m.scale.set(...opts.scale)
      group.add(m); return m
    }
    const cyl = (a: V3, b: V3, r: number, color: number, opacity = 1) => {
      const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b)
      const d = B.clone().sub(A); const L = d.length()
      const geo = own(new THREE.CylinderGeometry(r, r, L, 16))
      const mat = own(new THREE.MeshStandardMaterial({ color, roughness: 0.4, transparent: opacity < 1, opacity }))
      const m = new THREE.Mesh(geo, mat)
      m.position.copy(A.clone().add(B).multiplyScalar(0.5))
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())
      group.add(m); return m
    }
    const arrow = (a: V3, b: V3, r: number, color: number) => {
      const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b)
      const d = B.clone().sub(A); const L = d.length(); if (L < 0.05) return
      const dir = d.clone().normalize()
      const head = Math.min(0.4, L * 0.45)
      const shaftEnd = B.clone().sub(dir.clone().multiplyScalar(head))
      const mk = (geo: THREE.BufferGeometry, pos: THREE.Vector3) => {
        own(geo)
        const mat = own(new THREE.MeshStandardMaterial({ color, roughness: 0.3, emissive: color, emissiveIntensity: 0.35 }))
        const m = new THREE.Mesh(geo, mat); m.position.copy(pos)
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); group.add(m)
      }
      mk(new THREE.CylinderGeometry(r, r, L - head, 12), A.clone().add(shaftEnd).multiplyScalar(0.5))
      mk(new THREE.ConeGeometry(r * 2.6, head, 16), B.clone().sub(dir.clone().multiplyScalar(head / 2)))
    }
    const line = (pts: V3[], color: number, opacity = 1, dashed = false) => {
      const geo = own(new THREE.BufferGeometry().setFromPoints(pts.map((q) => new THREE.Vector3(...q))))
      const mat = own(dashed
        ? new THREE.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.08, transparent: true, opacity })
        : new THREE.LineBasicMaterial({ color, transparent: true, opacity }))
      const l = new THREE.Line(geo, mat); if (dashed) l.computeLineDistances(); group.add(l); return l
    }
    const sprite = (text: string, pos: V3, fg: string, bg: string, w = 0.95) => {
      const c = document.createElement('canvas'); c.width = 256; c.height = 96
      const g = c.getContext('2d')!
      g.fillStyle = bg; g.strokeStyle = fg; g.lineWidth = 4
      g.beginPath(); g.roundRect(6, 6, 244, 84, 24); g.fill(); g.stroke()
      g.fillStyle = fg; g.font = '600 46px -apple-system, Inter, Segoe UI, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'
      g.fillText(text, 128, 50)
      const tex = own(new THREE.CanvasTexture(c)); tex.colorSpace = THREE.SRGBColorSpace
      const mat = own(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }))
      const s = new THREE.Sprite(mat); s.position.set(...pos); s.scale.set(w, w * 96 / 256, 1); s.renderOrder = 10
      group.add(s)
    }

    const rebuild = (q: Mol3DProps) => {
      root.remove(group); owned.forEach((o) => o.dispose()); owned = []
      group = new THREE.Group(); root.add(group)
      const L = q.layout
      sphere([0, 0, 0], RAD[q.centre] ?? 0.5, CPK[q.centre] ?? 0x94a3b8)
      const perpOf = (d: V3): V3 => norm(cross(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]))
      L.bonds.forEach(({ dir, item }) => {
        const pos: V3 = [dir[0] * BOND_LEN, dir[1] * BOND_LEN, dir[2] * BOND_LEN]
        sphere(pos, RAD[item.sym] ?? 0.42, CPK[item.sym] ?? 0x94a3b8)
        const pr = perpOf(dir)
        const offs = item.order === 1 ? [0] : item.order === 2 ? [-0.11, 0.11] : [-0.19, 0, 0.19]
        offs.forEach((o) => cyl([pr[0] * o, pr[1] * o, pr[2] * o], [pos[0] + pr[0] * o, pos[1] + pr[1] * o, pos[2] + pr[2] * o], item.order === 1 ? 0.085 : 0.05, 0x64748b))
      })
      if (q.showLone !== false) {
        L.lone.forEach((d) => {
          const lobe = sphere([d[0] * 0.95, d[1] * 0.95, d[2] * 0.95], 0.5, 0x9333ea, { opacity: 0.5, scale: [0.85, 0.85, 1.3] })
          lobe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...d))
          sphere([d[0] * 0.68, d[1] * 0.68, d[2] * 0.68], 0.07, 0xe9d5ff)
        })
      }
      if (q.showDomains) {
        const R = BOND_LEN * 0.92
        const pts = L.ideal.map((d): V3 => [d[0] * R, d[1] * R, d[2] * R])
        polyhedronEdges(L.ideal).forEach(([i, j]) => line([pts[i], pts[j]], 0x2563eb, 0.65, true))
        pts.forEach((pt) => sphere(pt, 0.06, 0x2563eb))
      }
      if (q.showAngles) {
        L.pairs.forEach(({ i, j, label, ideal }) => {
          const a = norm(L.bonds[i].dir), b = norm(L.bonds[j].dir)
          if (ideal >= 179) { sprite(label, [0, 0.95, 0], '#b45309', '#fff7ed'); return }
          const arc: V3[] = []
          const th = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])))
          const R = 0.95
          for (let k = 0; k <= 16; k++) {
            const t = k / 16
            const s0 = Math.sin((1 - t) * th) / Math.sin(th), s1 = Math.sin(t * th) / Math.sin(th)
            arc.push([(a[0] * s0 + b[0] * s1) * R, (a[1] * s0 + b[1] * s1) * R, (a[2] * s0 + b[2] * s1) * R])
          }
          line(arc, 0xb45309)
          const m = norm([a[0] + b[0], a[1] + b[1], a[2] + b[2]])
          sprite(label, [m[0] * 1.5, m[1] * 1.5, m[2] * 1.5], '#b45309', '#fff7ed')
        })
      }
      if (q.dipole) {
        const D = q.dipole
        D.bonds.forEach((b) => {
          if (b.dEN < 0.05) return
          const pr = perpOf(b.dir)
          const off = 0.62
          const L0 = 0.4 + 0.4 * b.dEN
          const mid = BOND_LEN * 0.5
          const s = b.towardLig ? 1 : -1
          const from = mid - (s * L0) / 2, to = mid + (s * L0) / 2
          const P = (t: number): V3 => [b.dir[0] * t + pr[0] * off, b.dir[1] * t + pr[1] * off, b.dir[2] * t + pr[2] * off]
          arrow(P(from), P(to), 0.045, 0xf59e0b)
        })
        if (D.polar) {
          const n = D.net, len = Math.min(2.6, 0.8 + D.mag * 0.9)
          arrow([-n[0] * len * 0.15, -n[1] * len * 0.15 + 0.0, -n[2] * len * 0.15], [n[0] * len, n[1] * len, n[2] * len], 0.07, 0xdc2626)
          sprite('net μ', [n[0] * (len + 0.55), n[1] * (len + 0.55), n[2] * (len + 0.55)], '#b91c1c', '#fef2f2', 0.85)
        } else {
          sprite('net μ = 0', [0, 1.5, 0], '#15803d', '#e7f6ec', 1.1)
        }
      }
      dirty = true
    }

    api.current = {
      rebuild,
      reset: () => { view.theta = 0.65; view.phi = 1.2; view.r = 8.2; spin = true; placeCamera() },
    }
    placeCamera(); rebuild(latest.current)

    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      if (spin && latest.current.autoRotate !== false) { view.theta += 0.0035; placeCamera() }
      if (dirty) { renderer.render(scene, camera); dirty = false }
    }
    loop()

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect()
      dom.removeEventListener('pointerdown', onDown); dom.removeEventListener('pointermove', onMove)
      dom.removeEventListener('pointerup', onUp); dom.removeEventListener('pointercancel', onUp)
      dom.removeEventListener('wheel', onWheel)
      owned.forEach((o) => o.dispose()); owned = []
      renderer.dispose(); renderer.forceContextLoss()
      if (dom.parentNode === el) el.removeChild(dom)
      api.current = null
    }
  }, [])

  useEffect(() => { api.current?.rebuild(p) }, [p.layout, p.centre, p.showDomains, p.showLone, p.showAngles, p.dipole]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { api.current?.reset() }, [p.resetKey])

  return (
    <div className="l10-3d" style={{ height: p.height ?? 320 }}>
      <div ref={host} className="l10-3d-host" />
      {err && <div className="l10-3d-err">{err}</div>}
      {!err && <span className="l10-3d-hint">drag to rotate · scroll to zoom</span>}
    </div>
  )
}
