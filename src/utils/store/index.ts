import { $, Eq, IO, State, Tup } from 'fp'

export type Store<S> = {
  execute: <A>(f: State<S, A>) => IO<A>
  subscribe: (effect: IO<void>) => IO<{ unsubscribe: IO<void> }>
}

export const makeStore = <S>(initialState: S): Store<S> => {
  let state: S = initialState
  const ref = {
    getState: () => state,
    setState: (nextState: S) => () => {
      state = nextState
    },
  }
  let subscriptions: Array<IO<void>> = []
  const observable = {
    subscribe: (f: IO<void>) => () => {
      subscriptions.push(f)
      return {
        unsubscribe: () => {
          subscriptions = subscriptions.filter(i => i !== f)
        },
      }
    },
    dispatch: () => {
      subscriptions.map(f => f())
    },
  }
  const execute: Store<S>['execute'] = f =>
    $(
      () => ref.getState(),
      IO.chain(prev =>
        $(f(prev), result =>
          $(Tup.snd(result), next =>
            Eq.equals(Eq.eqStrict)(prev)(next)
              ? IO.of(Tup.fst(result))
              : $(
                  ref.getState,
                  IO.chain(current =>
                    Eq.equals(Eq.eqStrict)(prev)(current)
                      ? $(
                          ref.setState(next),
                          IO.chain(() => observable.dispatch),
                          IO.map(() => Tup.fst(result)),
                        )
                      : execute(f),
                  ),
                ),
          ),
        ),
      ),
    )
  return {
    execute,
    subscribe: observable.subscribe,
  }
}
