// Central widget registry: Learn sections, Practice tasks and Workspace panels look widgets up by id here.
import type { WidgetDef } from './types'
import { widgets as L7 } from './widgets/L7'
import { widgets as L8 } from './widgets/L8'
import { widgets as L9 } from './widgets/L9'
import { widgets as L10 } from './widgets/L10'
import { widgets as tools } from './widgets/tools'

export const WIDGETS: WidgetDef[] = [...L7, ...L8, ...L9, ...L10, ...tools]
export const WIDGET = new Map(WIDGETS.map((w) => [w.id, w]))
