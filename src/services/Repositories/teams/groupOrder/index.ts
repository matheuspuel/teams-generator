import { Effect } from 'fp'
import { GroupOrder } from 'src/datatypes'

export type groupOrder = {
  get: Effect<never, unknown, GroupOrder>
  set: (value: GroupOrder) => Effect<never, unknown, void>
}
