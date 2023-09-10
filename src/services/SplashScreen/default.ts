import * as SplashScreen_ from 'expo-splash-screen'
import { F, Layer, pipe } from 'fp'
import { SplashScreenEnv } from '.'

export const SplashScreenLive = SplashScreenEnv.context({
  preventAutoHide: () =>
    pipe(
      F.tryPromise(() => SplashScreen_.preventAutoHideAsync()),
      F.catchAll(() => F.unit),
    ),
  hide: () =>
    pipe(
      F.tryPromise(() => SplashScreen_.hideAsync()),
      F.catchAll(() => F.unit),
    ),
}).pipe(Layer.succeedContext)
