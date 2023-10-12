import { Effect } from 'effect/Effect'
import { sumAll } from 'effect/Number'
import { A, F, Match, Number, O, Ord, Order, flow, pipe } from 'fp'
import * as Player from 'src/datatypes/Player'
import * as Position from 'src/datatypes/Position'
import { findFirstMapWithIndex } from 'src/utils/Array'
import { randomizeArray } from 'src/utils/Random'
import { Modality } from './Modality'

type Player = Player.Player
type Position = Position.Position

const getFitOrdByDevianceFns = (
  fns: Array<(teams: Array<Array<Player>>) => number>,
): Order<Array<Array<Player>>> =>
  pipe(
    fns,
    A.map(f => Ord.mapInput(f)(Number.Order)),
    Ord.combineAll<Array<Array<Player>>>,
  )

const getResultPositionDeviance =
  (args: { modality: Modality }) =>
  (teams: Array<Array<Player>>): number =>
    pipe(teams, A.flatten, allPlayers =>
      pipe(
        args.modality.positions,
        A.map(pos =>
          pipe(
            allPlayers,
            positionCount(pos),
            n => n / teams.length,
            positionAvg =>
              pipe(
                teams,
                A.map(flow(positionCount(pos), deviance(positionAvg))),
                sumAll,
              ),
          ),
        ),
        sumAll,
      ),
    )

const fixFloatFactor = 1000000000000

const fixFloat = (v: number) => Math.round(v * fixFloatFactor) / fixFloatFactor

export const getResultRatingDeviance = (teams: Array<Array<Player>>): number =>
  pipe(teams, A.flatten, Player.getRatingAvg, overallAvg =>
    pipe(
      teams,
      A.map(flow(Player.getRatingAvg, deviance(overallAvg))),
      sumAll,
      fixFloat,
    ),
  )

const balanceTeams: (
  fitOrd: Order<Array<Array<Player>>>,
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
                        Ord.lt(fitOrd)(teams)(nextState)
                          ? O.some(balanceTeams(fitOrd)(nextState))
                          : O.none(),
                      ),
                    ),
                  ),
                ),
              )
            : O.none(),
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
      A.filter(p => p.positionId === position.id),
      A.length,
    )

const changePlayers =
  (teamIndex: number) =>
  (playerIndex: number) =>
  (otherTeamIndex: number) =>
  (otherPlayerIndex: number) =>
  (teams: Array<Array<Player>>): Array<Array<Player>> =>
    pipe(
      O.Do,
      O.bind('team', () => pipe(teams, A.get(teamIndex))),
      O.bind('otherTeam', () => pipe(teams, A.get(otherTeamIndex))),
      O.bind('player', ({ team }) => pipe(team, A.get(playerIndex))),
      O.bind('otherPlayer', ({ otherTeam }) =>
        pipe(otherTeam, A.get(otherPlayerIndex)),
      ),
      O.let('nextTeam', ({ team, otherPlayer }) =>
        pipe(team, A.remove(playerIndex), A.append(otherPlayer)),
      ),
      O.let('nextOtherTeam', ({ otherTeam, player }) =>
        pipe(otherTeam, A.remove(otherPlayerIndex), A.append(player)),
      ),
      O.flatMap(({ nextTeam, nextOtherTeam }) =>
        pipe(
          teams,
          A.replaceOption<Array<Player>>(teamIndex, nextTeam),
          O.flatMap(
            A.replaceOption<Array<Player>>(otherTeamIndex, nextOtherTeam),
          ),
        ),
      ),
      O.getOrElse(() => teams),
    )

export const divideTeamsWithEqualNumberOfPlayers =
  (numOfTeams: number) =>
  (players: Array<Player>): Array<Array<Player>> =>
    numOfTeams <= 0
      ? []
      : pipe(
          players,
          A.splitAt(Math.floor(players.length / numOfTeams)),
          ([as, bs]) =>
            pipe(
              divideTeamsWithEqualNumberOfPlayers(numOfTeams - 1)(bs),
              A.append(as),
            ),
        )

export const divideTeamsWithFixedNumberOfPlayers =
  (numOfPlayers: number) =>
  (players: Array<Player>): Array<Array<Player>> =>
    players.length === 0
      ? []
      : pipe(players, A.splitAt(numOfPlayers), ([as, bs]) =>
          pipe(
            divideTeamsWithFixedNumberOfPlayers(numOfPlayers)(bs),
            A.prepend(as),
          ),
        )

const divideTeams = (criteria: Criteria) =>
  pipe(
    criteria.distribution,
    Match.valueTags({
      numOfTeams: ({ numOfTeams }) =>
        divideTeamsWithEqualNumberOfPlayers(numOfTeams),
      fixedNumberOfPlayers: ({ fixedNumberOfPlayers }) =>
        divideTeamsWithFixedNumberOfPlayers(fixedNumberOfPlayers),
    }),
  )

export type Criteria = {
  position: boolean
  rating: boolean
  distribution:
    | { _tag: 'numOfTeams'; numOfTeams: number }
    | { _tag: 'fixedNumberOfPlayers'; fixedNumberOfPlayers: number }
}

export const getFitOrdFromCriteria =
  (args: { modality: Modality }) =>
  (criteria: Criteria): Order<Array<Array<Player>>> =>
    pipe(
      [
        criteria.position ? O.some(getResultPositionDeviance(args)) : O.none(),
        criteria.rating ? O.some(getResultRatingDeviance) : O.none(),
      ],
      A.compact,
      getFitOrdByDevianceFns,
    )

export const balanceTeamsByCriteria = (args: { modality: Modality }) =>
  flow(getFitOrdFromCriteria(args), balanceTeams)

export const distributeTeams =
  (args: { modality: Modality }) => (criteria: Criteria) =>
    flow(divideTeams(criteria), balanceTeamsByCriteria(args)(criteria))

export const generateRandomBalancedTeams =
  (args: { modality: Modality }) =>
  (criteria: Criteria) =>
  (players: Array<Player>): Effect<never, never, Array<Array<Player>>> =>
    pipe(randomizeArray(players), F.map(distributeTeams(args)(criteria)))
