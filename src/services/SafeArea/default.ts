import { Layer, O } from 'fp'
import { SafeAreaServiceEnv } from '.'

export const SafeAreaServiceLive = SafeAreaServiceEnv.context({
  initialMetrics: O.none(),
}).pipe(Layer.succeedContext)
