import * as Context from 'effect/Context'
import { Effect } from 'effect/Effect'
import { F } from 'src/utils/fp'

export type SplashScreen = {
  preventAutoHide: () => Effect<void>
  hide: () => Effect<void>
}

export class SplashScreenEnv extends Context.Tag('SplashScreen')<
  SplashScreenEnv,
  SplashScreen
>() {}

export const SplashScreen = F.serviceFunctions(SplashScreenEnv)
