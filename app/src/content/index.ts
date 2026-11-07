import type { Lecture, LectureId } from '../types'
import { lecture as L7 } from './L7'
import { lecture as L8 } from './L8'
import { lecture as L9 } from './L9'
import { lecture as L10 } from './L10'

export const CONTENT: Record<LectureId, Lecture> = { L7, L8, L9, L10 }
