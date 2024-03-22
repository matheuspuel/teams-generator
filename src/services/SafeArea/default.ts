import { Effect, Layer, Option } from 'effect'
import { SafeAreaService } from '.'

export const SafeAreaServiceLive = SafeAreaService.context({
  initialMetrics: () => Effect.succeed(Option.none()),
}).pipe(Layer.succeedContext)
