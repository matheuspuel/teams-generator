import { Effect, pipe } from 'effect'
import { Repository } from '..'
import { migration1 } from './migration1'

export const runMigrations = pipe(
  Repository.metadata.StorageVersion.get().pipe(
    Effect.orElseSucceed(() => ({ version: 0 })),
  ),
  Effect.tap(({ version }) => (version < 1 ? migration1 : Effect.void)),
)
