import { initialAppState, RootState } from 'src/model'
import { StateRef } from 'src/utils/datatypes'
import { Layer } from 'src/utils/fp'
import { AppStateRefEnv } from '.'

export const StateRefLive = AppStateRefEnv.context(
  StateRef.create<RootState>(initialAppState),
).pipe(Layer.succeedContext)
