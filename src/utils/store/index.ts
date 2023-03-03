import { $, $f, IO, State, Tup } from 'fp'
import { legacy_createStore, Store as ReduxStore } from 'redux'

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
        IO.map(f),
        // eslint-disable-next-line functional/no-return-void
        IO.chainFirst(
          $f(Tup.snd, nextState => () => {
            // eslint-disable-next-line functional/no-expression-statement
            reduxStore.dispatch({ type: 'modify', value: nextState })
          }),
        ),
        IO.map(Tup.fst),
      ),
    subscribe: effect => {
      const unsubscribe = reduxStore.subscribe(effect)
      return { unsubscribe }
    },
  }
}
