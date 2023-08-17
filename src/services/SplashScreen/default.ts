import * as SplashScreen_ from 'expo-splash-screen'
import { $, Eff } from 'fp'
import { SplashScreen } from '.'

export const defaultSplashScreen: SplashScreen = {
  preventAutoHide: $(
    Eff.tryPromise(() => SplashScreen_.preventAutoHideAsync()),
    Eff.catchAll(() => Eff.unit),
  ),
  hide: $(
    Eff.tryPromise(() => SplashScreen_.hideAsync()),
    Eff.catchAll(() => Eff.unit),
  ),
}
