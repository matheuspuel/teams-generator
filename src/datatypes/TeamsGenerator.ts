import {
  Array,
  Effect,
  Match,
  Number,
  Option,
  Order,
  flow,
  identity,
  pipe,
} from 'effect'
import { NonEmptyReadonlyArray } from 'effect/Array'
import { sumAll } from 'effect/Number'
import * as Player from 'src/datatypes/Player'
import * as Position from 'src/datatypes/Position'
import { randomizeArray } from 'src/utils/Random'
import { Modality } from './Modality'

type Player = Player.Player
type Position = Position.Position

const getFitOrdByDevianceFns = (
  fns: Array<(teams: Array<Array<Player>>) => number>,
): Order.Order<Array<Array<Player>>> =>
  pipe(
    fns,
    Array.map(f => Order.mapInput(f)(Number.Order)),
    Order.combineAll<Array<Array<Player>>>,
  )

const getResultPositionDeviance =
  (args: { modality: Modality }) =>
  (teams: Array<Array<Player>>): number =>
    pipe(teams, Array.flatten, allPlayers =>
      pipe(
        identity<
          NonEmptyReadonlyArray<
            Position.StaticPosition | Position.CustomPosition
          >
        >(args.modality.positions),
        Array.map(pos =>
          pipe(
            allPlayers,
            positionCount(pos),
            n => n / teams.length,
            positionAverage =>
              pipe(
                teams,
                Array.map(flow(positionCount(pos), deviance(positionAverage))),
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
  pipe(
    teams,
    Array.flatten,
    Player.getRatingAverage,
    Option.getOrElse(() => 0),
    overallAverage =>
      pipe(
        teams,
        Array.map(
          flow(
            Player.getRatingAverage,
            Option.getOrElse(() => 0),
            deviance(overallAverage),
          ),
        ),
        sumAll,
        fixFloat,
      ),
  )

const balanceTeams: (
  fitOrd: Order.Order<Array<Array<Player>>>,
) => (teams: Array<Array<Player>>) => Array<Array<Player>> = fitOrd => teams =>
  pipe(
    teams,
    Array.findFirst((team, i) =>
      pipe(
        teams,
        Array.findFirst((otherTeam, j) =>
          j > i
            ? pipe(
                team,
                Array.findFirst((_, k) =>
                  pipe(
                    otherTeam,
                    Array.findFirst((_, l) =>
                      pipe(changePlayers(i)(k)(j)(l)(teams), nextState =>
                        Order.lessThan(fitOrd)(teams)(nextState)
                          ? Option.some(balanceTeams(fitOrd)(nextState))
                          : Option.none(),
                      ),
                    ),
                  ),
                ),
              )
            : Option.none(),
        ),
      ),
    ),
    Option.getOrElse(() => teams),
  )

const deviance = (b: number) => (a: number) => Math.pow(Math.abs(a - b), 2)

const positionCount =
  (position: Position) =>
  (players: Array<Player>): number =>
    pipe(
      players,
      Array.filter(p => p.positionAbbreviation === position.abbreviation),
      Array.length,
    )

const changePlayers =
  (teamIndex: number) =>
  (playerIndex: number) =>
  (otherTeamIndex: number) =>
  (otherPlayerIndex: number) =>
  (teams: Array<Array<Player>>): Array<Array<Player>> =>
    pipe(
      Option.Do,
      Option.bind('team', () => pipe(teams, Array.get(teamIndex))),
      Option.bind('otherTeam', () => pipe(teams, Array.get(otherTeamIndex))),
      Option.bind('player', ({ team }) => pipe(team, Array.get(playerIndex))),
      Option.bind('otherPlayer', ({ otherTeam }) =>
        pipe(otherTeam, Array.get(otherPlayerIndex)),
      ),
      Option.let('nextTeam', ({ team, otherPlayer }) =>
        pipe(team, Array.remove(playerIndex), Array.append(otherPlayer)),
      ),
      Option.let('nextOtherTeam', ({ otherTeam, player }) =>
        pipe(otherTeam, Array.remove(otherPlayerIndex), Array.append(player)),
      ),
      Option.flatMap(({ nextTeam, nextOtherTeam }) =>
        pipe(
          teams,
          Array.replaceOption<Array<Player>>(teamIndex, nextTeam),
          Option.flatMap(
            Array.replaceOption<Array<Player>>(otherTeamIndex, nextOtherTeam),
          ),
        ),
      ),
      Option.getOrElse(() => teams),
    )

export const divideTeamsWithEqualNumberOfPlayers =
  (numOfTeams: number) =>
  (players: Array<Player>): Array<Array<Player>> =>
    numOfTeams <= 0
      ? []
      : pipe(
          players,
          Array.splitAt(Math.floor(players.length / numOfTeams)),
          ([as, bs]) =>
            pipe(
              divideTeamsWithEqualNumberOfPlayers(numOfTeams - 1)(bs),
              Array.append(as),
            ),
        )

export const divideTeamsWithFixedNumberOfPlayers =
  (numOfPlayers: number) =>
  (players: Array<Player>): Array<Array<Player>> =>
    players.length === 0
      ? []
      : pipe(players, Array.splitAt(numOfPlayers), ([as, bs]) =>
          pipe(
            divideTeamsWithFixedNumberOfPlayers(numOfPlayers)(bs),
            Array.prepend(as),
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
  (criteria: Criteria): Order.Order<Array<Array<Player>>> =>
    pipe(
      [
        criteria.position
          ? Option.some(getResultPositionDeviance(args))
          : Option.none(),
        criteria.rating ? Option.some(getResultRatingDeviance) : Option.none(),
      ],
      Array.getSomes,
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
  (players: Array<Player>): Effect.Effect<Array<Array<Player>>> =>
    pipe(randomizeArray(players), Effect.map(distributeTeams(args)(criteria)))
