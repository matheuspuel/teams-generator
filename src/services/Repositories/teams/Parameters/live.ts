import * as PR from '@effect/schema/ParseResult'
import { S } from 'fp'
import { Parameters } from 'src/datatypes'
import { createStorage } from 'src/utils/storage'
import { Repository } from '../..'

export const ParametersRepositoryLive: Repository['teams']['Parameters'] =
  createStorage<
    Parameters,
    S.Schema.Encoded<typeof Parameters.Schema | typeof Parameters.SchemaV1>
  >({
    key: 'core/parameters',
    schema: S.union(
      Parameters.Schema,
      S.transformOrFail(
        Parameters.SchemaV1,
        Parameters.Schema,
        v =>
          PR.succeed({
            ...v,
            teamsCountMethod: { _tag: 'count' as const },
            playersRequired: 11,
          }),
        (v, _, ast) => PR.fail(new PR.Forbidden(ast, v)),
      ),
    ),
  })
