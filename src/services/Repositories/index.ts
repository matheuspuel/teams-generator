/* eslint-disable functional/functional-parameters */
import { Context } from 'effect'
import { MetadataRepositories } from './metadata'
import { TeamsRepositories } from './teams'
import { TelemetryRepositories } from './telemetry'

export type RepositoryImplementation = {
  metadata: MetadataRepositories
  telemetry: TelemetryRepositories
  teams: TeamsRepositories
}

export class Repository extends Context.Tag('Repository')<
  Repository,
  RepositoryImplementation
>() {
  static metadata = MetadataRepositories(Repository)
  static telemetry = TelemetryRepositories(Repository)
  static teams = TeamsRepositories(Repository)
}
