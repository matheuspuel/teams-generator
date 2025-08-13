import { Effect } from 'effect'

export class SplashScreen extends Effect.Tag('SplashScreen')<
  SplashScreen,
  {
    preventAutoHide: () => Effect.Effect<void>
    hide: () => Effect.Effect<void>
  }
>() {}
