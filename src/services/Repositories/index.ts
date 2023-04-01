import { TE, TaskEither } from 'fp'
import { Parameters } from 'src/datatypes'
import { GroupsState } from 'src/slices/groups'

export type GroupsRepositoryEnv = {
  repositories: { Groups: GroupsRepository }
}

export type GroupsRepository = {
  get: TaskEither<unknown, GroupsState>
  set: (value: GroupsState) => TE.TaskEither<unknown, void>
}

export const GroupsRepository = {
  get: (env: GroupsRepositoryEnv) => env.repositories.Groups.get,
  set: (value: GroupsState) => (env: GroupsRepositoryEnv) =>
    env.repositories.Groups.set(value),
}

export type ParametersRepositoryEnv = {
  repositories: { Parameters: ParametersRepository }
}
export type ParametersRepository = {
  get: TaskEither<unknown, Parameters>
  set: (value: Parameters) => TE.TaskEither<unknown, void>
}

export const ParametersRepository = {
  get: (env: ParametersRepositoryEnv) => env.repositories.Parameters.get,
  set: (value: Parameters) => (env: ParametersRepositoryEnv) =>
    env.repositories.Parameters.set(value),
}
