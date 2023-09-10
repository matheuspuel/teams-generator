import { A, F, Layer, O, S, pipe } from 'fp'
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
            onNone: () => F.succeed(A.empty<TelemetryLog>()),
            onSome: S.decode(S.compose(S.ParseJson, S.array(Schema))),
          }),
        ),
        F.provideContext(ctx),
      ),
    concat: vs =>
      pipe(
        AsyncStorage.getItem(key),
        F.flatMap(
          O.match({
            onNone: () => F.succeed(A.empty<TelemetryLog>()),
            onSome: S.decode(S.compose(S.ParseJson, S.array(Schema))),
          }),
        ),
        F.map(A.appendAll(vs)),
        F.flatMap(S.encode(S.compose(S.ParseJson, S.array(Schema)))),
        F.flatMap(value => AsyncStorage.setItem({ key, value })),
        F.provideContext(ctx),
      ),
    clear: () => pipe(AsyncStorage.removeItem(key), F.provideContext(ctx)),
  }),
).pipe(Layer.effectContext)
