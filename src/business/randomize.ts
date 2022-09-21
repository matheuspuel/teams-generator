import * as Random from 'fp-ts/Random'
import { Player, PlayerNameOrd, PlayerPositionOrd } from 'src/datatypes/Player'
import { A, IO, IOO, none, O, Option, pipe, some } from 'src/utils/fp-ts'

// export const randomizeTeamsByPosition = (players: Player[]): IO<Player[][]> =>
//   pipe()

export const randomizeTeams = (players: Player[]): IO<Player[][]> =>
  pipe(
    Math.floor(players.length / 2), //
    n => randomExtractNElems(n)(players),
    IO.map(A.map(A.sortBy([PlayerPositionOrd, PlayerNameOrd]))),
  )

const randomExtractNElems =
  (n: number) =>
  <A>(as: A[]): IO<[A[], A[]]> =>
    pipe(
      n <= 0
        ? IO.of([[], as])
        : pipe(
            randomExtractElem(as),
            IOO.matchW(
              () => IO.of<[A[], A[]]>([[], as]),
              ([elem, rest]) =>
                pipe(
                  randomExtractNElems(n - 1)(rest),
                  IO.map(([elems, rr]): [A[], A[]] => [[elem, ...elems], rr]),
                ),
            ),
            IO.flatten,
          ),
    )

const randomExtractElem = <A>(as: A[]): IO<Option<[A, A[]]>> =>
  pipe(
    Random.randomInt(0, as.length - 1),
    IO.map(v => (console.log('v', v), console.log('len', as.length - 1), v)),
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
