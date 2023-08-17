import { $, $f, A, D, E, Eff, Json, O } from 'fp'
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
    Eff.flatMap(
      O.match({
        onNone: () => E.right(A.empty<TelemetryLog>()),
        onSome: $f(Json.parse, E.flatMap(D.parseEither(D.array(Schema)))),
      }),
    ),
    Eff.provideService(AsyncStorageEnv, env),
  ),
  concat: vs =>
    $(
      AsyncStorage.getItem(key),
      Eff.flatMap(
        O.match({
          onNone: () => E.right(A.empty<Readonly<TelemetryLog>>()),
          onSome: $f(Json.parse, E.flatMap(D.parseEither(D.array(Schema)))),
        }),
      ),
      Eff.map(A.appendAll(vs)),
      Eff.flatMap(D.encodeEither(D.array(Schema))),
      Eff.flatMap(Json.stringify),
      Eff.flatMap(AsyncStorage.setItem(key)),
      Eff.provideService(AsyncStorageEnv, env),
    ),
  clear: $(
    AsyncStorage.removeItem(key),
    Eff.provideService(AsyncStorageEnv, env),
  ),
})
