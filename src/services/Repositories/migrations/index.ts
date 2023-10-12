import { F, pipe } from 'fp'
import { Repository } from '..'
import { migration1 } from './migration1'

export const runMigrations = pipe(
  Repository.metadata.StorageVersion.get().pipe(
    F.orElseSucceed(() => ({ version: 0 })),
  ),
  F.tap(({ version }) => (version < 1 ? migration1 : F.unit)),
)
