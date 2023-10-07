/* eslint-disable functional/functional-parameters */
import { MetadataRepositories } from './metadata'
import { TeamsRepositories } from './teams'
import { TelemetryRepositories } from './telemetry'

export type Repository = {
  metadata: MetadataRepositories
  telemetry: TelemetryRepositories
  teams: TeamsRepositories
}

export const Repository = {
  metadata: MetadataRepositories,
  telemetry: TelemetryRepositories,
  teams: TeamsRepositories,
}
