import * as SplashScreen_ from 'expo-splash-screen'
import { $, F, Layer } from 'fp'
import { SplashScreenEnv } from '.'

export const SplashScreenLive = SplashScreenEnv.context({
  preventAutoHide: $(
    F.tryPromise(() => SplashScreen_.preventAutoHideAsync()),
    F.catchAll(() => F.unit),
  ),
  hide: $(
    F.tryPromise(() => SplashScreen_.hideAsync()),
    F.catchAll(() => F.unit),
  ),
}).pipe(Layer.succeedContext)
