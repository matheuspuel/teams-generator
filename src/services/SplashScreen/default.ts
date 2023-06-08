import * as SplashScreen_ from 'expo-splash-screen'
import { $, Eff, identity } from 'fp'
import { SplashScreen } from '.'

export const defaultSplashScreen: SplashScreen = {
  preventAutoHide: $(
    Eff.tryCatchPromise(() => SplashScreen_.preventAutoHideAsync(), identity),
    Eff.catchAll(() => Eff.unit()),
  ),
  hide: $(
    Eff.tryCatchPromise(() => SplashScreen_.hideAsync(), identity),
    Eff.catchAll(() => Eff.unit()),
  ),
}
