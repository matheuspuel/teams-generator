import { Layer, Ref } from 'effect'
import { RootState, initialAppState } from 'src/model'
import { AppStateRef, Subscription } from '.'

export const AppStateRefDefault = AppStateRef.context({
  ref: Ref.unsafeMake<RootState>(initialAppState),
  subscriptionsRef: Ref.unsafeMake<ReadonlyArray<Subscription>>([]),
}).pipe(Layer.succeedContext)
