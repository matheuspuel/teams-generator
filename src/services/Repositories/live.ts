import { Effect, Layer } from 'effect'
import { MetadataRepositoriesLive } from './metadata/live'
import { RepositoryEnv } from './tag'
import { TeamsRepositoriesLive } from './teams/live'
import { TelemetryRepositoriesLive } from './telemetry/live'

export const RepositoryLive = Effect.all({
  metadata: Effect.succeed(MetadataRepositoriesLive),
  teams: Effect.succeed(TeamsRepositoriesLive),
  telemetry: TelemetryRepositoriesLive,
}).pipe(
  Effect.map(_ => RepositoryEnv.context(_)),
  Layer.effectContext,
)
