import { F } from 'src/utils/fp'
import { RepositoryEnv } from '../tag'
import { InstallationRepository } from './Installation'
import { StorageVersionRepository } from './StorageVersion'

export type MetadataRepositories = {
  Installation: InstallationRepository
  StorageVersion: StorageVersionRepository
}

export const MetadataRepositories = {
  Installation: {
    get: F.serviceFunctionEffect(
      RepositoryEnv,
      r => r.metadata.Installation.get,
    ),
    set: F.serviceFunctionEffect(
      RepositoryEnv,
      r => r.metadata.Installation.set,
    ),
  },
  StorageVersion: {
    get: F.serviceFunctionEffect(
      RepositoryEnv,
      r => r.metadata.StorageVersion.get,
    ),
    set: F.serviceFunctionEffect(
      RepositoryEnv,
      r => r.metadata.StorageVersion.set,
    ),
  },
}
