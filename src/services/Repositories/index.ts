import { Context } from 'effect'
import { MetadataRepositories } from './metadata'
import { TeamsRepositories } from './teams'

export type RepositoryImplementation = {
  metadata: MetadataRepositories
  teams: TeamsRepositories
}

export class Repository extends Context.Tag('Repository')<
  Repository,
  RepositoryImplementation
>() {
  static metadata = MetadataRepositories(Repository)
  static teams = TeamsRepositories(Repository)
}
