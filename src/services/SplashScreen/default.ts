import { Effect, Layer, pipe } from 'effect'
import * as SplashScreen_ from 'expo-splash-screen'
import { SplashScreen } from '.'

export const SplashScreenLive = SplashScreen.context({
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
