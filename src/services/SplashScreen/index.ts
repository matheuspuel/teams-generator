import { Context, Effect } from 'effect'

export type SplashScreen = {
  preventAutoHide: () => Effect.Effect<void>
  hide: () => Effect.Effect<void>
}

export class SplashScreenEnv extends Context.Tag('SplashScreen')<
  SplashScreenEnv,
  SplashScreen
>() {}

export const SplashScreen = Effect.serviceFunctions(SplashScreenEnv)
