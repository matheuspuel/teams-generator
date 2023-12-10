import { Effect } from 'effect/Effect'
import { GroupsState } from 'src/slices/groups'

export type GroupsRepository = {
  get: () => Effect<never, unknown, GroupsState>
  set: (value: GroupsState) => Effect<never, unknown, void>
}
