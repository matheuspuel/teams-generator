import { Effect } from 'effect'
import { Repository } from '..'
import { InstallationRepository } from './Installation'
import { StorageVersionRepository } from './StorageVersion'

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
