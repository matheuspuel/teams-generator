import { initialAppState, RootState } from 'src/model'
import { Layer, Ref } from 'src/utils/fp'
import { AppStateRefEnv } from '.'

export const StateRefLive = AppStateRefEnv.context({
  ref: Ref.unsafeMake<RootState>(initialAppState),
  subscriptionsRef: Ref.unsafeMake([]),
}).pipe(Layer.succeedContext)
