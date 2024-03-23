import { Effect } from 'effect'

export type SplashScreenImplementation = {
  preventAutoHide: () => Effect.Effect<void>
  hide: () => Effect.Effect<void>
}

export class SplashScreen extends Effect.Tag('SplashScreen')<
  SplashScreen,
  SplashScreenImplementation
>() {}
