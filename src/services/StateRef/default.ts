import { initialAppState, RootState } from 'src/model'
import { Layer, Ref } from 'src/utils/fp'
import { AppStateRefEnv, Subscription } from '.'

export const StateRefLive = AppStateRefEnv.context({
  ref: Ref.unsafeMake<RootState>(initialAppState),
  subscriptionsRef: Ref.unsafeMake<ReadonlyArray<Subscription>>([]),
}).pipe(Layer.succeedContext)
