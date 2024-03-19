import { Effect, Layer, Option } from 'effect'
import { SafeAreaServiceEnv } from '.'

export const SafeAreaServiceTest = SafeAreaServiceEnv.context({
  initialMetrics: () =>
    Effect.succeed(
      Option.some({
        frame: {
          width: 320,
          height: 640,
          x: 0,
          y: 0,
        },
        insets: {
          left: 0,
          right: 0,
          bottom: 0,
          top: 0,
        },
      }),
    ),
}).pipe(Layer.succeedContext)
