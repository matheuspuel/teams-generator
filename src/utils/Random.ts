import { $, A, IO, IOO, none, O, Option, some } from 'fp'
import * as Random from 'fp-ts/Random'

export const randomizeArray = <A>(as: Array<A>): IO<Array<A>> =>
  $(
    randomExtractElem(as), //
    IOO.matchEW(
      () => IO.of([]),
      ([a, rest]) => $(randomizeArray(rest), IO.map(A.append(a))),
    ),
  )

const randomExtractElem = <A>(as: Array<A>): IO<Option<[A, Array<A>]>> =>
  $(
    Random.randomInt(0, as.length - 1),
    IO.map(i => extractElem(i)(as)),
  )

const extractElem =
  (index: number) =>
  <A>(as: Array<A>): Option<[A, Array<A>]> =>
    $(
      O.Do(),
      O.bind('elem', () => O.fromNullable(as[index])),
      O.let('rest', () => A.remove(index)(as)),
      O.match(
        () => none(),
        ({ elem, rest }) => some([elem, rest]),
      ),
    )
