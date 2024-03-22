import { Effect } from 'effect'

export type SplashScreen = {
  preventAutoHide: () => Effect.Effect<void>
  hide: () => Effect.Effect<void>
}

export class SplashScreenEnv extends Effect.Tag('SplashScreen')<
  SplashScreenEnv,
  SplashScreen
>() {}

export const SplashScreen = Effect.serviceFunctions(SplashScreenEnv)
