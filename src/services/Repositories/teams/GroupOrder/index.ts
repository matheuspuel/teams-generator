import type { Effect } from 'effect'
import type { GroupOrder } from 'src/datatypes'

export type GroupOrderRepository = {
  get: () => Effect.Effect<GroupOrder, unknown>
  set: (value: GroupOrder) => Effect.Effect<void, unknown>
}
