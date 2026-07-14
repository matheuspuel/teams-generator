import { Effect } from 'effect'
import type { Repository } from '..'
import type { InstallationRepository } from './Installation'
import type { StorageVersionRepository } from './StorageVersion'

export type MetadataRepositories = {
  Installation: InstallationRepository
  StorageVersion: StorageVersionRepository
}

export const MetadataRepositories = (Tag: typeof Repository) => ({
  Installation: Effect.serviceFunctions(
    Effect.map(Tag, r => r.metadata.Installation),
  ),
  StorageVersion: Effect.serviceFunctions(
    Effect.map(Tag, r => r.metadata.StorageVersion),
  ),
})
