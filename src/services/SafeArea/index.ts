import { Effect, Option } from 'effect'
import { Metrics } from 'react-native-safe-area-context'

export type SafeAreaServiceImplementation = {
  initialMetrics: () => Effect.Effect<Option.Option<Metrics>>
}

export class SafeAreaService extends Effect.Tag('SafeAreaService')<
  SafeAreaService,
  SafeAreaServiceImplementation
>() {}
