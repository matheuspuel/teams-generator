import * as Context from 'effect/Context'
import { Effect } from 'effect/Effect'
import { F } from 'src/utils/fp'

export type SplashScreen = {
  preventAutoHide: () => Effect<never, never, void>
  hide: () => Effect<never, never, void>
}

export const SplashScreenEnv = Context.Tag<SplashScreen>()

export const SplashScreen = F.serviceFunctions(SplashScreenEnv)
