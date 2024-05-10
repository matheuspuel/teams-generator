import { Effect, Layer, pipe } from 'effect'
import * as SplashScreen_ from 'expo-splash-screen'
import { SplashScreen } from '.'

export const SplashScreenLive = SplashScreen.context({
  preventAutoHide: () =>
    pipe(
      Effect.tryPromise(() => SplashScreen_.preventAutoHideAsync()),
      Effect.catchAll(() => Effect.void),
    ),
  hide: () =>
    pipe(
      Effect.tryPromise(() => SplashScreen_.hideAsync()),
      Effect.catchAll(() => Effect.void),
    ),
}).pipe(Layer.succeedContext)
