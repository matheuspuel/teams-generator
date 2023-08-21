import { $, $f, A, D, E, F, Json, O } from 'fp'
import { AsyncStorage, AsyncStorageEnv } from 'src/services/AsyncStorage'
import { TelemetryLog, TelemetryLogSchema } from 'src/services/Telemetry'
import { Repositories } from '../..'

const key = 'log'

const Schema = TelemetryLogSchema

export const defaultLogRepository = (
  env: AsyncStorageEnv,
): Repositories.telemetry.log => ({
  get: $(
    AsyncStorage.getItem(key),
    F.flatMap(
      O.match({
        onNone: () => E.right(A.empty<TelemetryLog>()),
        onSome: $f(Json.parse, E.flatMap(D.parseEither(D.array(Schema)))),
      }),
    ),
    F.provideService(AsyncStorageEnv, env),
  ),
  concat: vs =>
    $(
      AsyncStorage.getItem(key),
      F.flatMap(
        O.match({
          onNone: () => E.right(A.empty<Readonly<TelemetryLog>>()),
          onSome: $f(Json.parse, E.flatMap(D.parseEither(D.array(Schema)))),
        }),
      ),
      F.map(A.appendAll(vs)),
      F.flatMap(D.encodeEither(D.array(Schema))),
      F.flatMap(Json.stringify),
      F.flatMap(AsyncStorage.setItem(key)),
      F.provideService(AsyncStorageEnv, env),
    ),
  clear: $(
    AsyncStorage.removeItem(key),
    F.provideService(AsyncStorageEnv, env),
  ),
})
