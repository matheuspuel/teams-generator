import * as SplashScreen_ from 'expo-splash-screen'
import { $, T, TE, constVoid, identity } from 'fp'
import { SplashScreen } from '.'

export const defaultSplashScreen: SplashScreen = {
  preventAutoHide: $(
    TE.tryCatch(() => SplashScreen_.preventAutoHideAsync(), identity),
    T.map(constVoid),
  ),
  hide: $(
    TE.tryCatch(() => SplashScreen_.hideAsync(), identity),
    T.map(constVoid),
  ),
}
