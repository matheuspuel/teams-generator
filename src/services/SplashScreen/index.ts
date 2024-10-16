import { Effect, pipe } from 'effect'
import * as SplashScreen_ from 'expo-splash-screen'

export class SplashScreen extends Effect.Service<SplashScreen>()(
  'SplashScreen',
  {
    accessors: true,
    succeed: {
      preventAutoHide: () =>
        pipe(
          Effect.tryPromise(() => SplashScreen_.preventAutoHideAsync()),
          Effect.ignore,
        ),
      hide: () =>
        pipe(
          Effect.tryPromise(() => SplashScreen_.hideAsync()),
          Effect.ignore,
        ),
    },
  },
) {}
