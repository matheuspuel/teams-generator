import * as Context from '@effect/data/Context'
import { Effect } from '@effect/io/Effect'
import { F } from 'src/utils/fp'

export type SplashScreen = {
  preventAutoHide: Effect<never, never, void>
  hide: Effect<never, never, void>
}

export type SplashScreenEnv = { splashScreen: SplashScreen }

export const SplashScreenEnv = Context.Tag<SplashScreenEnv>()

export const SplashScreen = {
  preventAutoHide: F.flatMap(
    SplashScreenEnv,
    env => env.splashScreen.preventAutoHide,
  ),
  hide: F.flatMap(SplashScreenEnv, env => env.splashScreen.hide),
}
