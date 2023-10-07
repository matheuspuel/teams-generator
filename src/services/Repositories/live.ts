import { F, Layer } from 'fp'
import { MetadataRepositoriesLive } from './metadata/live'
import { RepositoryEnv } from './tag'
import { TeamsRepositoriesLive } from './teams/live'
import { TelemetryRepositoriesLive } from './telemetry/live'

export const RepositoryLive = F.all({
  metadata: F.succeed(MetadataRepositoriesLive),
  teams: F.succeed(TeamsRepositoriesLive),
  telemetry: TelemetryRepositoriesLive,
}).pipe(
  F.map(_ => RepositoryEnv.context(_)),
  Layer.effectContext,
)
