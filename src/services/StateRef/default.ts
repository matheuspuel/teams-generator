import { initialAppState, RootState } from 'src/model'
import { StateRef } from 'src/utils/datatypes'
import { AppStateRef } from '.'

export const defaultStateRef: AppStateRef =
  StateRef.create<RootState>(initialAppState)
