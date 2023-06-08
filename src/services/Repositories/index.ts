import * as Context from '@effect/data/Context'
import { Effect } from '@effect/io/Effect'
import { GroupOrder, Parameters } from 'src/datatypes'
import { GroupsState } from 'src/slices/groups'
import { Eff } from 'src/utils/fp'

export type GroupsRepositoryEnv = {
  repositories: { Groups: GroupsRepository }
}

export const GroupsRepositoryEnv = Context.Tag<GroupsRepositoryEnv>()

export type GroupsRepository = {
  get: Effect<never, unknown, GroupsState>
  set: (value: GroupsState) => Effect<never, unknown, void>
}

export const GroupsRepository = {
  get: Eff.flatMap(GroupsRepositoryEnv, env => env.repositories.Groups.get),
  set: (value: GroupsState) =>
    Eff.flatMap(GroupsRepositoryEnv, env => env.repositories.Groups.set(value)),
}

export const ParametersRepositoryEnv = Context.Tag<ParametersRepositoryEnv>()

export type ParametersRepositoryEnv = {
  repositories: { Parameters: ParametersRepository }
}
export type ParametersRepository = {
  get: Effect<never, unknown, Parameters>
  set: (value: Parameters) => Effect<never, unknown, void>
}

export const ParametersRepository = {
  get: Eff.flatMap(
    ParametersRepositoryEnv,
    env => env.repositories.Parameters.get,
  ),
  set: (value: Parameters) =>
    Eff.flatMap(ParametersRepositoryEnv, env =>
      env.repositories.Parameters.set(value),
    ),
}

export const GroupOrderRepositoryEnv = Context.Tag<GroupOrderRepositoryEnv>()

export type GroupOrderRepositoryEnv = {
  repositories: { GroupOrder: GroupOrderRepository }
}
export type GroupOrderRepository = {
  get: Effect<never, unknown, GroupOrder>
  set: (value: GroupOrder) => Effect<never, unknown, void>
}

export const GroupOrderRepository = {
  get: Eff.flatMap(
    GroupOrderRepositoryEnv,
    env => env.repositories.GroupOrder.get,
  ),
  set: (value: GroupOrder) =>
    Eff.flatMap(GroupOrderRepositoryEnv, env =>
      env.repositories.GroupOrder.set(value),
    ),
}
