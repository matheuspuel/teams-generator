import { Schema } from '@effect/schema'
import { Effect, Option, ReadonlyArray, pipe } from 'effect'
import { AsyncStorage, AsyncStorageEnv } from 'src/services/AsyncStorage'
import { TelemetryLog, TelemetryLogSchema } from 'src/services/Telemetry'
import { Repository } from '../..'

const key = 'log'

const LogSchema = TelemetryLogSchema

export const LogRepositoryLive = Effect.map(
  Effect.context<AsyncStorageEnv>(),
  (ctx): Repository['telemetry']['Log'] => ({
    get: () =>
      pipe(
        AsyncStorage.getItem(key),
        Effect.flatMap(
          Option.match({
            onNone: () => Effect.succeed(ReadonlyArray.empty<TelemetryLog>()),
            onSome: Schema.decode(Schema.parseJson(Schema.array(LogSchema))),
          }),
        ),
        Effect.provide(ctx),
      ),
    concat: vs =>
      pipe(
        AsyncStorage.getItem(key),
        Effect.flatMap(
          Option.match({
            onNone: () => Effect.succeed(ReadonlyArray.empty<TelemetryLog>()),
            onSome: Schema.decode(Schema.parseJson(Schema.array(LogSchema))),
          }),
        ),
        Effect.map(ReadonlyArray.appendAll(vs)),
        Effect.flatMap(
          Schema.encode(Schema.parseJson(Schema.array(LogSchema))),
        ),
        Effect.flatMap(value => AsyncStorage.setItem({ key, value })),
        Effect.provide(ctx),
      ),
    clear: () => pipe(AsyncStorage.removeItem(key), Effect.provide(ctx)),
  }),
)
