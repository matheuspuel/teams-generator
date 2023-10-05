import { initialAppState, RootState } from 'src/model'
import { F, Layer, Ref } from 'src/utils/fp'
import { AppStateRefEnv } from '.'

export const StateRefLive = AppStateRefEnv.context(
  Ref.make<RootState>(initialAppState).pipe(
    F.runSync,
    r => r as typeof r & { _StateRef: true },
  ),
).pipe(Layer.succeedContext)
