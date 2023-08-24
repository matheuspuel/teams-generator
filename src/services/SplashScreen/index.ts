import * as Context from '@effect/data/Context'
import { Effect } from '@effect/io/Effect'
import { F } from 'src/utils/fp'

export type SplashScreen = {
  preventAutoHide: Effect<never, never, void>
  hide: Effect<never, never, void>
}

export const SplashScreenEnv = Context.Tag<SplashScreen>()

export const SplashScreen = {
  preventAutoHide: F.flatMap(SplashScreenEnv, env => env.preventAutoHide),
  hide: F.flatMap(SplashScreenEnv, env => env.hide),
}
