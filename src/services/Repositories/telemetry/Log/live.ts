import { A, F, O, S, pipe } from 'fp'
import { AsyncStorage, AsyncStorageEnv } from 'src/services/AsyncStorage'
import { TelemetryLog, TelemetryLogSchema } from 'src/services/Telemetry'
import { Repository } from '../..'

const key = 'log'

const Schema = TelemetryLogSchema

export const LogRepositoryLive = F.map(
  F.context<AsyncStorageEnv>(),
  (ctx): Repository['telemetry']['Log'] => ({
    get: () =>
      pipe(
        AsyncStorage.getItem(key),
        F.flatMap(
          O.match({
            onNone: () => F.succeed(A.empty<TelemetryLog>()),
            onSome: S.decode(S.parseJson(S.array(Schema))),
          }),
        ),
        F.provide(ctx),
      ),
    concat: vs =>
      pipe(
        AsyncStorage.getItem(key),
        F.flatMap(
          O.match({
            onNone: () => F.succeed(A.empty<TelemetryLog>()),
            onSome: S.decode(S.parseJson(S.array(Schema))),
          }),
        ),
        F.map(A.appendAll(vs)),
        F.flatMap(S.encode(S.parseJson(S.array(Schema)))),
        F.flatMap(value => AsyncStorage.setItem({ key, value })),
        F.provide(ctx),
      ),
    clear: () => pipe(AsyncStorage.removeItem(key), F.provide(ctx)),
  }),
)
