import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import { pipe as $ } from 'fp-ts/function'
import * as Eq from './Eq'

export * from 'fp-ts/Array'

export const isArray = <A>(a: A): a is Extract<A, ReadonlyArray<unknown>> =>
  Array.isArray(a)

export const getUnorderedEq = <A>(E: Eq.Eq<A>): Eq.Eq<Array<A>> =>
  Eq.fromEquals((as, bs) =>
    $(
      as,
      A.matchLeft(
        () => A.isEmpty(bs),
        (a, as_) =>
          $(
            A.findIndex(Eq.equals(E)(a))(bs),
            O.chain(i => A.deleteAt(i)(bs)),
            O.matchW(() => false, Eq.equals(getUnorderedEq(E))(as_)),
          ),
      ),
    ),
  )
