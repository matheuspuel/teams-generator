import { Effect, Layer, Option } from 'effect'
import { SafeAreaServiceEnv } from '.'

export const SafeAreaServiceLive = SafeAreaServiceEnv.context({
  initialMetrics: () => Effect.succeed(Option.none()),
}).pipe(Layer.succeedContext)
