import { Effect } from 'effect/Effect'
import { GroupsState } from 'src/slices/groups'

export type GroupsRepository = {
  get: () => Effect<GroupsState, unknown>
  set: (value: GroupsState) => Effect<void, unknown>
}
