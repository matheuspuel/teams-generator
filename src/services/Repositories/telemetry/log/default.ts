import { A, D, E, F, Json, Layer, O, flow, pipe } from 'fp'
import { AsyncStorage } from 'src/services/AsyncStorage'
import { TelemetryLog, TelemetryLogSchema } from 'src/services/Telemetry'
import { RepositoryEnvs } from '../..'

const key = 'log'

const Schema = TelemetryLogSchema

export const LogRepositoryLive = F.map(F.context<AsyncStorage>(), ctx =>
  RepositoryEnvs.telemetry.log.context({
    get: () =>
      pipe(
        AsyncStorage.getItem(key),
        F.flatMap(
          O.match({
            onNone: () => E.right(A.empty<TelemetryLog>()),
            onSome: flow(Json.parse, E.flatMap(D.parseEither(D.array(Schema)))),
          }),
        ),
        F.provideContext(ctx),
      ),
    concat: vs =>
      pipe(
        AsyncStorage.getItem(key),
        F.flatMap(
          O.match({
            onNone: () => E.right(A.empty<Readonly<TelemetryLog>>()),
            onSome: flow(Json.parse, E.flatMap(D.parseEither(D.array(Schema)))),
          }),
        ),
        F.map(A.appendAll(vs)),
        F.flatMap(D.encodeEither(D.array(Schema))),
        F.flatMap(Json.stringify),
        F.flatMap(value => AsyncStorage.setItem({ key, value })),
        F.provideContext(ctx),
      ),
    clear: () => pipe(AsyncStorage.removeItem(key), F.provideContext(ctx)),
  }),
).pipe(Layer.effectContext)
