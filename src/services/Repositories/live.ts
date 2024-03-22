import { Effect, Layer } from 'effect'
import { Repository } from '.'
import { MetadataRepositoriesLive } from './metadata/live'
import { TeamsRepositoriesLive } from './teams/live'
import { TelemetryRepositoriesLive } from './telemetry/live'

export const RepositoryLive = Effect.all({
  metadata: Effect.succeed(MetadataRepositoriesLive),
  teams: Effect.succeed(TeamsRepositoriesLive),
  telemetry: TelemetryRepositoriesLive,
}).pipe(
  Effect.map(_ => Repository.context(_)),
  Layer.effectContext,
)
