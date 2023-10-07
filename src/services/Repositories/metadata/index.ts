import { F } from 'src/utils/fp'
import { RepositoryEnv } from '../tag'
import { InstallationRepository } from './Installation'

export type MetadataRepositories = {
  Installation: InstallationRepository
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
}
