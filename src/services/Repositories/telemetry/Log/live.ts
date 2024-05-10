import { Schema } from '@effect/schema'
import { Array, Effect, Option, pipe } from 'effect'
import { AsyncStorage } from 'src/services/AsyncStorage'
import { TelemetryLog, TelemetryLogSchema } from 'src/services/Telemetry'
import { LogRepository } from '.'

const key = 'log'

const LogSchema = TelemetryLogSchema

export const LogRepositoryLive = Effect.map(
  Effect.context<AsyncStorage>(),
  (ctx): LogRepository => ({
    get: () =>
      pipe(
        AsyncStorage.getItem(key),
        Effect.flatMap(
          Option.match({
            onNone: () => Effect.succeed(Array.empty<TelemetryLog>()),
            onSome: Schema.decode(Schema.parseJson(Schema.Array(LogSchema))),
          }),
        ),
        Effect.provide(ctx),
      ),
    concat: vs =>
      pipe(
        AsyncStorage.getItem(key),
        Effect.flatMap(
          Option.match({
            onNone: () => Effect.succeed(Array.empty<TelemetryLog>()),
            onSome: Schema.decode(Schema.parseJson(Schema.Array(LogSchema))),
          }),
        ),
        Effect.map(Array.appendAll(vs)),
        Effect.flatMap(
          Schema.encode(Schema.parseJson(Schema.Array(LogSchema))),
        ),
        Effect.flatMap(value => AsyncStorage.setItem({ key, value })),
        Effect.provide(ctx),
      ),
    clear: () => pipe(AsyncStorage.removeItem(key), Effect.provide(ctx)),
  }),
)
