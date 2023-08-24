import { Effect } from '@effect/io/Effect'
import * as Random from '@effect/io/Random'
import { $, A, F, O, Option } from 'fp'

export const randomizeArray = <A>(
  as: Array<A>,
): Effect<never, never, Array<A>> =>
  $(
    randomExtractElem(as),
    F.flatMap(
      O.match({
        onNone: () => F.succeed(A.empty<A>()),
        onSome: ([a, rest]) => $(randomizeArray(rest), F.map(A.append(a))),
      }),
    ),
  )

const randomExtractElem = <A>(
  as: Array<A>,
): Effect<never, never, Option<[A, Array<A>]>> =>
  $(
    Random.nextIntBetween(0, as.length),
    F.map(i => extractElem(i)(as)),
  )

const extractElem =
  (index: number) =>
  <A>(as: Array<A>): Option<[A, Array<A>]> =>
    O.all([O.fromNullable(as[index]), O.some(A.remove(index)(as))])
