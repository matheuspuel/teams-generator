import { Effect, Layer } from 'effect'
import { Repository } from '.'
import { MetadataRepositoriesLive } from './metadata/live'
import { TeamsRepositoriesLive } from './teams/live'

export const RepositoryDefault = Effect.all({
  metadata: Effect.succeed(MetadataRepositoriesLive),
  teams: Effect.succeed(TeamsRepositoriesLive),
}).pipe(
  Effect.map(_ => Repository.context(_)),
  Layer.effectContext,
)
