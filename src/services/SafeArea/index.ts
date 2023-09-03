import { Context, Effect, F, Option } from 'fp'
import { Metrics } from 'react-native-safe-area-context'

export type SafeAreaService = {
  initialMetrics: () => Effect<never, never, Option<Metrics>>
}

export const SafeAreaServiceEnv = Context.Tag<SafeAreaService>()

export const SafeAreaService = F.serviceFunctions(SafeAreaServiceEnv)
