import { $, Eq, IO, State, Tup } from 'fp'
import * as Observable from 'src/utils/datatypes/Observable'
import * as Ref from 'src/utils/datatypes/Ref'

type Observable<S> = Observable.Observable<S>
type Ref<S> = Ref.Ref<S>

export type StateRef<S> = {
  execute: <A>(f: State<S, A>) => IO<A>
  subscribe: (effect: IO<void>) => IO<{ unsubscribe: IO<void> }>
}

export const create = <S>(initialState: S): StateRef<S> => {
  const ref: Ref<S> = Ref.create(initialState)
  const observable = Observable.create<void>()
  const execute: StateRef<S>['execute'] = f =>
    $(
      ref.getState,
      IO.chain(prev =>
        $(f(prev), result =>
          $(Tup.snd(result), next =>
            Eq.equals(Eq.strict())(prev)(next)
              ? IO.of(Tup.fst(result))
              : $(
                  ref.getState,
                  IO.chain(current =>
                    Eq.equals(Eq.strict())(prev)(current)
                      ? $(
                          ref.setState(next),
                          IO.chain(() => observable.dispatch(undefined)),
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
    subscribe: f => observable.subscribe(() => f),
  }
}
