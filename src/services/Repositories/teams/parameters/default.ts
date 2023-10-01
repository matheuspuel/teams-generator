import * as PR from '@effect/schema/ParseResult'
import { Layer, S } from 'fp'
import { Parameters } from 'src/datatypes'
import { createStorage } from 'src/utils/storage'
import { RepositoryEnvs } from '../..'

export const ParametersRepositoryLive = RepositoryEnvs.teams.parameters
  .context(
    createStorage<
      S.Schema.From<typeof Parameters.Schema | typeof Parameters.SchemaV1>,
      Parameters
    >({
      key: 'core/parameters',
      schema: S.union(
        Parameters.Schema,
        S.transformOrFail(
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
    }),
  )
  .pipe(Layer.succeedContext)
