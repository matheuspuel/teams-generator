import { Effect, Layer, pipe } from 'effect'
import * as SplashScreen_ from 'expo-splash-screen'
import { SplashScreenEnv } from '.'

export const SplashScreenLive = SplashScreenEnv.context({
  preventAutoHide: () =>
    pipe(
      Effect.tryPromise(() => SplashScreen_.preventAutoHideAsync()),
      Effect.catchAll(() => Effect.unit),
    ),
  hide: () =>
    pipe(
      Effect.tryPromise(() => SplashScreen_.hideAsync()),
      Effect.catchAll(() => Effect.unit),
    ),
}).pipe(Layer.succeedContext)
