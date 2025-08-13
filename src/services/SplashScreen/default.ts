import { Effect, Layer, pipe } from 'effect'
import * as SplashScreen_ from 'expo-splash-screen'
import { SplashScreen } from '.'

export const SplashScreenDefault = SplashScreen.context({
  preventAutoHide: () =>
    pipe(
      Effect.tryPromise(() => SplashScreen_.preventAutoHideAsync()),
      Effect.ignore,
    ),
  hide: () =>
    pipe(
      Effect.tryPromise(() => SplashScreen_.hideAsync()),
      Effect.ignore,
    ),
}).pipe(Layer.succeedContext)
