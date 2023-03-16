import { initialStoreState, RootState } from 'src/model'
import { makeStore } from 'src/utils/store'
import { selectorHook, SelectorHook } from 'src/utils/store/react/selector'
import { AppStore } from '.'

export const useAppSelector: SelectorHook<RootState> = selectorHook

export const store: AppStore = makeStore<RootState>(initialStoreState)
