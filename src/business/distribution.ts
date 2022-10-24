import * as Monoid from 'fp-ts/Monoid'
import { getRatingAvg, Player } from 'src/datatypes/Player'
import { Position, PositionDict } from 'src/datatypes/Position'
import { findFirstMapWithIndex } from 'src/utils/Array'
import {
  A,
  flow,
  IO,
  none,
  Num,
  O,
  Ord,
  pipe,
  Rec,
  some,
  Tup,
} from 'src/utils/fp-ts'
import { randomizeArray } from '../utils/Random'

const getFitOrdByDevianceFns = (
  fns: Array<(teams: Player[][]) => number>,
): Ord<Player[][]> =>
  pipe(
    fns,
    A.map(f => Ord.contramap(f)(Num.Ord)),
    Monoid.concatAll(Ord.getMonoid<Player[][]>()),
  )

export const getResultPositionDeviance = (teams: Player[][]): number =>
  pipe(teams, A.flatten, allPlayers =>
    pipe(
      PositionDict,
      Rec.toEntries,
      A.map(Tup.fst),
      A.foldMap(Num.MonoidSum)(pos =>
        pipe(
          allPlayers,
          positionCount(pos),
          n => n / teams.length,
          positionAvg =>
            pipe(
              teams,
              A.foldMap(Num.MonoidSum)(
                flow(positionCount(pos), deviance(positionAvg)),
              ),
            ),
        ),
      ),
    ),
  )

export const getResultRatingDeviance = (teams: Player[][]): number =>
  pipe(teams, A.flatten, getRatingAvg, overallAvg =>
    pipe(
      teams,
      A.foldMap(Num.MonoidSum)(flow(getRatingAvg, deviance(overallAvg))),
    ),
  )

const balanceTeams: (
  fitOrd: Ord<Player[][]>,
) => (teams: Player[][]) => Player[][] = fitOrd => teams =>
  pipe(
    teams,
    findFirstMapWithIndex((i, team) =>
      pipe(
        teams,
        findFirstMapWithIndex((j, otherTeam) =>
          j > i
            ? pipe(
                team,
                findFirstMapWithIndex(k =>
                  pipe(
                    otherTeam,
                    findFirstMapWithIndex(l =>
                      pipe(changePlayers(i)(k)(j)(l)(teams), nextState =>
                        Ord.lt(fitOrd)(nextState, teams)
                          ? some(balanceTeams(fitOrd)(nextState))
                          : none,
                      ),
                    ),
                  ),
                ),
              )
            : none,
        ),
      ),
    ),
    O.getOrElse(() => teams),
  )

const deviance = (b: number) => (a: number) => Math.pow(Math.abs(a - b), 2)

const positionCount =
  (position: Position) =>
  (players: Player[]): number =>
    pipe(
      players,
      A.filter(p => p.position === position),
      A.size,
    )

const changePlayers =
  (teamIndex: number) =>
  (playerIndex: number) =>
  (otherTeamIndex: number) =>
  (otherPlayerIndex: number) =>
  (teams: Player[][]): Player[][] => {
    const team = teams[teamIndex]
    const otherTeam = teams[otherTeamIndex]
    if (!team) return teams
    if (!otherTeam) return teams
    const player = team[playerIndex]
    const otherPlayer = otherTeam[otherPlayerIndex]
    if (!player || !otherPlayer) return teams
    const nextTeam = [...team.filter((p, i) => i !== playerIndex), otherPlayer]
    const nextOtherTeam = [
      ...otherTeam.filter((p, i) => i !== otherPlayerIndex),
      player,
    ]
    const nextResult = teams.map((t, i) =>
      i === teamIndex ? nextTeam : i === otherTeamIndex ? nextOtherTeam : t,
    )
    return nextResult
  }

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

const generateRandomBalancedTeamsByDevianceFns =
  (devianceFns: Array<(teams: Player[][]) => number>) =>
  (numOfTeams: number) =>
  (players: Player[]): IO<Player[][]> =>
    pipe(
      randomizeArray(players),
      IO.map(divideTeams(numOfTeams)),
      IO.map(balanceTeams(getFitOrdByDevianceFns(devianceFns))),
    )

export const generateRandomBalancedTeams = (criteria: {
  position: boolean
  rating: boolean
}) =>
  pipe(
    [
      A.fromPredicate(() => criteria.position)(getResultPositionDeviance),
      A.fromPredicate(() => criteria.rating)(getResultRatingDeviance),
    ],
    Monoid.concatAll(A.getMonoid()),
    generateRandomBalancedTeamsByDevianceFns,
  )
