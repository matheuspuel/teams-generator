import { $, $f, A, D, E, F, Json, Layer, O } from 'fp'
import { AsyncStorage } from 'src/services/AsyncStorage'
import { TelemetryLog, TelemetryLogSchema } from 'src/services/Telemetry'
import { RepositoryEnvs } from '../..'

const key = 'log'

const Schema = TelemetryLogSchema

export const LogRepositoryLive = F.map(F.context<AsyncStorage>(), ctx =>
  RepositoryEnvs.telemetry.log.context({
    get: $(
      AsyncStorage.getItem(key),
      F.flatMap(
        O.match({
          onNone: () => E.right(A.empty<TelemetryLog>()),
          onSome: $f(Json.parse, E.flatMap(D.parseEither(D.array(Schema)))),
        }),
      ),
      F.provideContext(ctx),
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
        F.provideContext(ctx),
      ),
    clear: $(AsyncStorage.removeItem(key), F.provideContext(ctx)),
  }),
).pipe(Layer.effectContext)
