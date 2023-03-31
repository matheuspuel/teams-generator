import { initialStoreState, RootState } from 'src/model'
import { makeStore } from 'src/utils/store'
import { AppStore } from '.'

export const store: AppStore = makeStore<RootState>(initialStoreState)
