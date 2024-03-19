import { Schema } from '@effect/schema'
import * as PR from '@effect/schema/ParseResult'
import { Parameters } from 'src/datatypes'
import { createStorage } from 'src/utils/storage'
import { Repository } from '../..'

export const ParametersRepositoryLive: Repository['teams']['Parameters'] =
  createStorage<
    Parameters,
    Schema.Schema.Encoded<
      typeof Parameters.Parameters | typeof Parameters.SchemaV1
    >
  >({
    key: 'core/parameters',
    schema: Schema.union(
      Parameters.Parameters,
      Schema.transformOrFail(
        Parameters.SchemaV1,
        Parameters.Parameters,
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
