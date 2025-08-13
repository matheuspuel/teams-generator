import { Effect, Option } from 'effect'
import type { Metrics } from 'react-native-safe-area-context'

export class SafeAreaService extends Effect.Service<SafeAreaService>()(
  'SafeAreaService',
  {
    accessors: true,
    succeed: {
      initialMetrics: () => Effect.succeed(Option.none<Metrics>()),
    },
  },
) {}
