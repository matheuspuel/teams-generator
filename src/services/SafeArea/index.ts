import { Context, Effect, Option } from 'effect'
import { Metrics } from 'react-native-safe-area-context'

export type SafeAreaService = {
  initialMetrics: () => Effect.Effect<Option.Option<Metrics>>
}

export class SafeAreaServiceEnv extends Context.Tag('SafeAreaService')<
  SafeAreaServiceEnv,
  SafeAreaService
>() {}

export const SafeAreaService = Effect.serviceFunctions(SafeAreaServiceEnv)
