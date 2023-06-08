import { $, $f, A, Eff, Effect, Eq, apply, not } from 'fp'
import * as Ref from './Ref'

type SubscribableFunction<A> = (value: A) => Effect<never, never, void>

export type Observable<A> = {
  subscribe: (
    f: SubscribableFunction<A>,
  ) => Effect<never, never, { unsubscribe: Effect<never, never, void> }>
  dispatch: (value: A) => Effect<never, never, void>
}

export const create = <A>(): Observable<A> =>
  $(Ref.create<Array<SubscribableFunction<A>>>([]), subscriptionsRef => ({
    subscribe: (f: SubscribableFunction<A>) =>
      $(
        subscriptionsRef.getState,
        Eff.flatMap($f(A.append(f), subscriptionsRef.setState)),
        Eff.map(() => ({
          unsubscribe: $(
            subscriptionsRef.getState,
            Eff.flatMap(
              $f(
                A.filter(not(Eq.equals(Eq.strict())(f))),
                subscriptionsRef.setState,
              ),
            ),
          ),
        })),
      ),
    dispatch: value =>
      $(subscriptionsRef.getState, Eff.flatMap(Eff.forEach(apply(value)))),
  }))
