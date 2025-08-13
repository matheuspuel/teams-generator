import { ParseResult, Schema } from 'effect'
import { Parameters } from 'src/datatypes'
import { createStorage } from 'src/utils/storage'
import { ParameterRepository } from '.'

export const ParametersRepositoryLive: ParameterRepository = createStorage<
  Parameters,
  Schema.Schema.Encoded<
    typeof Parameters.Parameters | typeof Parameters.SchemaV1
  >
>({
  key: 'core/parameters',
  schema: Schema.Union(
    Parameters.Parameters,
    Schema.transformOrFail(Parameters.SchemaV1, Parameters.Parameters, {
      decode: v =>
        ParseResult.succeed({
          ...v,
          teamsCountMethod: { _tag: 'count' as const },
          playersRequired: 11,
        }),
      encode: (v, _, ast) =>
        ParseResult.fail(new ParseResult.Forbidden(ast, v)),
    }),
  ),
})
