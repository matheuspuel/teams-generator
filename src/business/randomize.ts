import * as Random from 'fp-ts/Random'
import { Player } from 'src/datatypes/Player'
import { A, IO, IOO, none, O, Option, pipe, some } from 'src/utils/fp-ts'

// export const randomizeTeamsByPosition = (players: Player[]): IO<Player[][]> =>
//   pipe(
//     groupByPosition(players), //
//   )

// const groupByPosition = (
//   players: Player[],
// ): Partial<Record<Position, Player[]>> =>
//   pipe(
//     players,
//     A.reduce<Player, Partial<Record<Position, Player[]>>>(
//       {},
//       (groups, player) => ({
//         ...groups,
//         [player.position]: [...(groups[player.position] ?? []), player],
//       }),
//     ),
//   )

export const randomizeTeams =
  (numOfTeams: number) =>
  (players: Player[]): IO<Player[][]> =>
    pipe(randomizeArray(players), IO.map(divideTeams(numOfTeams)))

const divideTeams =
  (numOfTeams: number) =>
  (players: Player[]): Player[][] =>
    numOfTeams <= 0
      ? []
      : pipe(
          players,
          A.splitAt(Math.floor(players.length / numOfTeams)),
          ([as, bs]) => pipe(divideTeams(numOfTeams - 1)(bs), A.appendW(as)),
        )

const randomizeArray = <A>(as: A[]): IO<A[]> =>
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
