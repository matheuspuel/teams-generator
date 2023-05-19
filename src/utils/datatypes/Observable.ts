import { $, $f, A, Eq, IO, apply, not } from 'fp'
import * as Ref from './Ref'

type SubscribableFunction<A> = (value: A) => IO<void>

export type Observable<A> = {
  subscribe: (f: SubscribableFunction<A>) => IO<{
    unsubscribe: IO<void>
  }>
  dispatch: (value: A) => IO<void>
}

export const create = <A>(): Observable<A> =>
  $(Ref.create<Array<SubscribableFunction<A>>>([]), subscriptionsRef => ({
    subscribe: (f: SubscribableFunction<A>) =>
      $(
        subscriptionsRef.getState,
        IO.chain($f(A.append(f), subscriptionsRef.setState)),
        IO.map(() => ({
          unsubscribe: $(
            subscriptionsRef.getState,
            IO.chain(
              $f(
                A.filter(not(Eq.equals(Eq.strict())(f))),
                subscriptionsRef.setState,
              ),
            ),
          ),
        })),
      ),
    dispatch: value =>
      $(subscriptionsRef.getState, IO.chain(IO.traverseArray(apply(value)))),
  }))
