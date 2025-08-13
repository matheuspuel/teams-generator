import { Layer, Ref } from 'effect'
import { unstable_batchedUpdates } from 'react-native'
import { RootState, initialAppState } from 'src/model'
import { AppStateRef, Subscription } from '.'

export const AppStateRefDefault = AppStateRef.context({
  ref: Ref.unsafeMake<RootState>(initialAppState),
  subscriptionsRef: Ref.unsafeMake<ReadonlyArray<Subscription>>([]),
  batchedUpdates: unstable_batchedUpdates,
}).pipe(Layer.succeedContext)
