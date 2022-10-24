import * as Random from 'fp-ts/Random'
import { A, IO, IOO, none, O, Option, pipe, some } from 'src/utils/fp-ts'

export const randomizeArray = <A>(as: A[]): IO<A[]> =>
  pipe(
    randomExtractElem(as), //
    IOO.matchEW(
      () => IO.of([]),
      ([a, rest]) => pipe(randomizeArray(rest), IO.map(A.append(a))),
    ),
  )

const randomExtractElem = <A>(as: A[]): IO<Option<[A, A[]]>> =>
  pipe(
    Random.randomInt(0, as.length - 1),
    IO.map(i => extractElem(i)(as)),
  )

const extractElem =
  (index: number) =>
  <A>(as: A[]): Option<[A, A[]]> =>
    pipe(
      O.Do,
      O.bind('elem', () => O.fromNullable(as[index])),
      O.bind('rest', () => A.deleteAt(index)(as)),
      O.matchW(
        () => none,
        ({ elem, rest }) => some([elem, rest]),
      ),
    )
