import { $, $f, constVoid, Eq, IO, O, State, Tup } from 'fp'
import { not } from 'fp-ts/Predicate'
import { legacy_createStore, Store as ReduxStore } from 'redux'
import { equals } from 'src/utils/Eq'

export type Store<S> = {
  _reduxStore: ReduxStore
  execute: <A>(f: State<S, A>) => IO<A>
  subscribe: (effect: IO<void>) => { unsubscribe: IO<void> }
}

export const makeStore = <S>(initialState: S): Store<S> => {
  const reduxStore = legacy_createStore(
    (state: S | undefined, action: { type: 'modify'; value: S }) =>
      state === undefined ? initialState : action.value,
  )
  return {
    _reduxStore: reduxStore,
    execute: f =>
      $(
        () => reduxStore.getState(),
        IO.chain(prev =>
          $(
            IO.of(f(prev)),
            IO.chainFirst(
              $f(
                Tup.snd,
                O.fromPredicate(not(equals(Eq.eqStrict)(prev))),
                O.match(
                  () => constVoid,
                  next => () =>
                    reduxStore.dispatch({ type: 'modify', value: next }),
                ),
              ),
            ),
            IO.map(Tup.fst),
          ),
        ),
      ),
    subscribe: effect => {
      const unsubscribe = reduxStore.subscribe(effect)
      return { unsubscribe }
    },
  }
}
