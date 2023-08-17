import { Effect } from '@effect/io/Effect'
import * as Random from '@effect/io/Random'
import { $, A, Eff, O, Option } from 'fp'

export const randomizeArray = <A>(
  as: Array<A>,
): Effect<never, never, Array<A>> =>
  $(
    randomExtractElem(as),
    Eff.flatMap(
      O.match({
        onNone: () => Eff.succeed(A.empty<A>()),
        onSome: ([a, rest]) => $(randomizeArray(rest), Eff.map(A.append(a))),
      }),
    ),
  )

const randomExtractElem = <A>(
  as: Array<A>,
): Effect<never, never, Option<[A, Array<A>]>> =>
  $(
    Random.nextIntBetween(0, as.length - 1),
    Eff.map(i => extractElem(i)(as)),
  )

const extractElem =
  (index: number) =>
  <A>(as: Array<A>): Option<[A, Array<A>]> =>
    O.all([O.fromNullable(as[index]), O.some(A.remove(index)(as))])
