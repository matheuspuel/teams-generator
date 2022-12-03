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
  fns: Array<(teams: Array<Array<Player>>) => number>,
): Ord<Array<Array<Player>>> =>
  pipe(
    fns,
    A.map(f => Ord.contramap(f)(Num.Ord)),
    Monoid.concatAll(Ord.getMonoid<Array<Array<Player>>>()),
  )

export const getResultPositionDeviance = (
  teams: Array<Array<Player>>,
): number =>
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

export const getResultRatingDeviance = (teams: Array<Array<Player>>): number =>
  pipe(teams, A.flatten, getRatingAvg, overallAvg =>
    pipe(
      teams,
      A.foldMap(Num.MonoidSum)(flow(getRatingAvg, deviance(overallAvg))),
    ),
  )

const balanceTeams: (
  fitOrd: Ord<Array<Array<Player>>>,
) => (teams: Array<Array<Player>>) => Array<Array<Player>> = fitOrd => teams =>
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
  (players: Array<Player>): number =>
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
  (teams: Array<Array<Player>>): Array<Array<Player>> =>
    pipe(
      O.Do,
      O.apS('team', pipe(teams, A.lookup(teamIndex))),
      O.apS('otherTeam', pipe(teams, A.lookup(otherTeamIndex))),
      O.bind('player', ({ team }) => pipe(team, A.lookup(playerIndex))),
      O.bind('otherPlayer', ({ otherTeam }) =>
        pipe(otherTeam, A.lookup(otherPlayerIndex)),
      ),
      O.bind('nextTeam', ({ team, otherPlayer }) =>
        pipe(team, A.deleteAt(playerIndex), O.map(A.append(otherPlayer))),
      ),
      O.bind('nextOtherTeam', ({ otherTeam, player }) =>
        pipe(otherTeam, A.deleteAt(otherPlayerIndex), O.map(A.append(player))),
      ),
      O.chain(({ nextTeam, nextOtherTeam }) =>
        pipe(
          teams,
          A.updateAt<Array<Player>>(teamIndex, nextTeam),
          O.chain(A.updateAt<Array<Player>>(otherTeamIndex, nextOtherTeam)),
        ),
      ),
      O.getOrElse(() => teams),
    )

const divideTeams =
  (numOfTeams: number) =>
  (players: Array<Player>): Array<Array<Player>> =>
    numOfTeams <= 0
      ? []
      : pipe(
          players,
          A.splitAt(Math.floor(players.length / numOfTeams)),
          ([as, bs]) => pipe(divideTeams(numOfTeams - 1)(bs), A.appendW(as)),
        )

const generateRandomBalancedTeamsByDevianceFns =
  (devianceFns: Array<(teams: Array<Array<Player>>) => number>) =>
  (numOfTeams: number) =>
  (players: Array<Player>): IO<Array<Array<Player>>> =>
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
