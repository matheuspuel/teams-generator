import { MetadataRepositories } from '.'
import { InstallationRepositoryLive } from './Installation/live'
import { StorageVersionRepositoryLive } from './StorageVersion/live'

export const MetadataRepositoriesLive: MetadataRepositories = {
  Installation: InstallationRepositoryLive,
  StorageVersion: StorageVersionRepositoryLive,
}
