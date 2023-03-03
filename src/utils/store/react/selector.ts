import { Eq, eqStrict } from 'fp-ts/Eq'
import { useSelector } from 'react-redux'

export type SelectorHook<S> = <A>(selector: (state: S) => A, eq?: Eq<A>) => A

export const selectorHook = <S, A>(selector: (state: S) => A, eq?: Eq<A>): A =>
  useSelector(selector, (eq ?? eqStrict).equals)
