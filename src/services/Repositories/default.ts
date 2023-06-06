import * as PR from '@effect/schema/ParseResult'
import { D } from 'fp'
import { Group, GroupOrder, Parameters } from 'src/datatypes'
import { GroupsState } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'
import { createStorage } from 'src/utils/storage'
import { GroupOrderRepository, GroupsRepository, ParametersRepository } from '.'

export const defaultGroupsRepository: GroupsRepository = createStorage<
  Record<string, D.From<typeof Group.Schema>>,
  GroupsState
>({
  key: 'core/groups',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  schema: D.record(Id as any, Group.Schema),
})

export const defaultParametersRepository: ParametersRepository = createStorage<
  D.From<typeof Parameters.Schema | typeof Parameters.SchemaV1>,
  Parameters
>({
  key: 'core/parameters',
  schema: D.union(
    Parameters.Schema,
    D.transformResult(
      Parameters.SchemaV1,
      Parameters.Schema,
      v =>
        PR.success({
          ...v,
          teamsCountMethod: { _tag: 'count' as const },
          playersRequired: 11,
        }),
      () => PR.failure(PR.forbidden),
    ),
  ),
})

export const defaultGroupOrderRepository: GroupOrderRepository = createStorage<
  GroupOrder,
  GroupOrder
>({
  key: 'core/groupOrder',
  schema: GroupOrder.Schema,
})
