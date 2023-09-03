import { F, Layer, O } from 'fp'
import { SafeAreaServiceEnv } from '.'

export const SafeAreaServiceLive = SafeAreaServiceEnv.context({
  initialMetrics: () => F.succeed(O.none()),
}).pipe(Layer.succeedContext)
