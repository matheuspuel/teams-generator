import { Effect } from 'effect'
import { RepositoryEnv } from '../tag'
import { InstallationRepository } from './Installation'
import { StorageVersionRepository } from './StorageVersion'

export type MetadataRepositories = {
  Installation: InstallationRepository
  StorageVersion: StorageVersionRepository
}

export const MetadataRepositories = {
  Installation: {
    get: Effect.serviceFunctionEffect(
      RepositoryEnv,
      r => r.metadata.Installation.get,
    ),
    set: Effect.serviceFunctionEffect(
      RepositoryEnv,
      r => r.metadata.Installation.set,
    ),
  },
  StorageVersion: {
    get: Effect.serviceFunctionEffect(
      RepositoryEnv,
      r => r.metadata.StorageVersion.get,
    ),
    set: Effect.serviceFunctionEffect(
      RepositoryEnv,
      r => r.metadata.StorageVersion.set,
    ),
  },
}
