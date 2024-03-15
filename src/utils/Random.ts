import { Effect } from 'effect/Effect'
import * as Random from 'effect/Random'
import { A, F, O, Option, pipe } from 'fp'

export const randomizeArray = <A>(as: Array<A>): Effect<Array<A>> =>
  pipe(
    randomExtractElem(as),
    F.flatMap(
      O.match({
        onNone: () => F.succeed(A.empty<A>()),
        onSome: ([a, rest]) => pipe(randomizeArray(rest), F.map(A.append(a))),
      }),
    ),
  )

const randomExtractElem = <A>(as: Array<A>): Effect<Option<[A, Array<A>]>> =>
  pipe(
    Random.nextIntBetween(0, as.length),
    F.map(i => extractElem(i)(as)),
  )

const extractElem =
  (index: number) =>
  <A>(as: Array<A>): Option<[A, Array<A>]> =>
    O.all([O.fromNullable(as[index]), O.some(A.remove(index)(as))])
