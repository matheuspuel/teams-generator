import { $, F, Effect, Eq, State, Tup } from 'fp'
import * as Observable from 'src/utils/datatypes/Observable'
import * as Ref from 'src/utils/datatypes/Ref'

type Observable<S> = Observable.Observable<S>
type Ref<S> = Ref.Ref<S>

export type StateRef<S> = {
  execute: <A>(f: State<S, A>) => Effect<never, never, A>
  subscribe: (
    effect: Effect<never, never, void>,
  ) => Effect<never, never, { unsubscribe: Effect<never, never, void> }>
}

export const create = <S>(initialState: S): StateRef<S> => {
  const ref: Ref<S> = Ref.create(initialState)
  const observable = Observable.create<void>()
  const execute: StateRef<S>['execute'] = f =>
    $(
      ref.getState,
      F.flatMap(prev =>
        $(f(prev), result =>
          $(Tup.getSecond(result), next =>
            Eq.equals(Eq.strict())(prev)(next)
              ? F.succeed(Tup.getFirst(result))
              : $(
                  ref.getState,
                  F.flatMap(current =>
                    Eq.equals(Eq.strict())(prev)(current)
                      ? $(
                          ref.setState(next),
                          F.flatMap(() => observable.dispatch(undefined)),
                          F.map(() => Tup.getFirst(result)),
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
