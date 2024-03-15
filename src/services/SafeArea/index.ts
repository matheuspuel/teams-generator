import { Context, Effect, F, Option } from 'fp'
import { Metrics } from 'react-native-safe-area-context'

export type SafeAreaService = {
  initialMetrics: () => Effect<Option<Metrics>>
}

export class SafeAreaServiceEnv extends Context.Tag('SafeAreaService')<
  SafeAreaServiceEnv,
  SafeAreaService
>() {}

export const SafeAreaService = F.serviceFunctions(SafeAreaServiceEnv)
