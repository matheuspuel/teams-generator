import { $, $f, A, F, Effect, Eq, apply, not } from 'fp'
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
        F.flatMap($f(A.append(f), subscriptionsRef.setState)),
        F.map(() => ({
          unsubscribe: $(
            subscriptionsRef.getState,
            F.flatMap(
              $f(
                A.filter(not(Eq.equals(Eq.strict())(f))),
                subscriptionsRef.setState,
              ),
            ),
          ),
        })),
      ),
    dispatch: value =>
      $(subscriptionsRef.getState, F.flatMap(F.forEach(apply(value)))),
  }))
