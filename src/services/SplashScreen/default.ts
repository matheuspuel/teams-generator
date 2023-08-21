import * as SplashScreen_ from 'expo-splash-screen'
import { $, F } from 'fp'
import { SplashScreen } from '.'

export const defaultSplashScreen: SplashScreen = {
  preventAutoHide: $(
    F.tryPromise(() => SplashScreen_.preventAutoHideAsync()),
    F.catchAll(() => F.unit),
  ),
  hide: $(
    F.tryPromise(() => SplashScreen_.hideAsync()),
    F.catchAll(() => F.unit),
  ),
}
