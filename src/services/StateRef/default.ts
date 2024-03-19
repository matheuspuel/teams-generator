import { Layer, Ref } from 'effect'
import { initialAppState, RootState } from 'src/model'
import { AppStateRefEnv, Subscription } from '.'

export const StateRefLive = AppStateRefEnv.context({
  ref: Ref.unsafeMake<RootState>(initialAppState),
  subscriptionsRef: Ref.unsafeMake<ReadonlyArray<Subscription>>([]),
}).pipe(Layer.succeedContext)
