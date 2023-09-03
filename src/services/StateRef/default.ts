import { initialAppState, RootState } from 'src/model'
import { F, Layer, SubscriptionRef } from 'src/utils/fp'
import { AppStateRefEnv } from '.'

export const StateRefLive = AppStateRefEnv.context(
  SubscriptionRef.make<RootState>(initialAppState).pipe(F.runSync),
).pipe(Layer.succeedContext)
