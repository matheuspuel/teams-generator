import { Context, Option } from 'fp'
import { Metrics } from 'react-native-safe-area-context'

export type SafeAreaService = { initialMetrics: Option<Metrics> }

export const SafeAreaServiceEnv = Context.Tag<SafeAreaService>()

export const SafeAreaService = {
  initialMetrics: (env: SafeAreaService) => env.initialMetrics,
}
