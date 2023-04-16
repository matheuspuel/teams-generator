import { Option } from 'fp'
import { Metrics } from 'react-native-safe-area-context'

export type SafeAreaService = { initialMetrics: Option<Metrics> }

export type SafeAreaServiceEnv = { safeArea: SafeAreaService }

export const SafeAreaService = {
  initialMetrics: (env: SafeAreaServiceEnv) => env.safeArea.initialMetrics,
}
