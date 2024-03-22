import {
  Effect,
  Match,
  Number,
  Option,
  Order,
  ReadonlyArray,
  flow,
  identity,
  pipe,
} from 'effect'
import { sumAll } from 'effect/Number'
import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
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
    ReadonlyArray.map(f => Order.mapInput(f)(Number.Order)),
    Order.combineAll<Array<Array<Player>>>,
  )

const getResultPositionDeviance =
  (args: { modality: Modality }) =>
  (teams: Array<Array<Player>>): number =>
    pipe(teams, ReadonlyArray.flatten, allPlayers =>
      pipe(
        identity<
          NonEmptyReadonlyArray<
            Position.StaticPosition | Position.CustomPosition
          >
        >(args.modality.positions),
        ReadonlyArray.map(pos =>
          pipe(
            allPlayers,
            positionCount(pos),
            n => n / teams.length,
            positionAverage =>
              pipe(
                teams,
                ReadonlyArray.map(
                  flow(positionCount(pos), deviance(positionAverage)),
                ),
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
    ReadonlyArray.flatten,
    Player.getRatingAverage,
    Option.getOrElse(() => 0),
    overallAverage =>
      pipe(
        teams,
        ReadonlyArray.map(
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
    ReadonlyArray.findFirst((team, i) =>
      pipe(
        teams,
        ReadonlyArray.findFirst((otherTeam, j) =>
          j > i
            ? pipe(
                team,
                ReadonlyArray.findFirst((_, k) =>
                  pipe(
                    otherTeam,
                    ReadonlyArray.findFirst((_, l) =>
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
      ReadonlyArray.filter(
        p => p.positionAbbreviation === position.abbreviation,
      ),
      ReadonlyArray.length,
    )

const changePlayers =
  (teamIndex: number) =>
  (playerIndex: number) =>
  (otherTeamIndex: number) =>
  (otherPlayerIndex: number) =>
  (teams: Array<Array<Player>>): Array<Array<Player>> =>
    pipe(
      Option.Do,
      Option.bind('team', () => pipe(teams, ReadonlyArray.get(teamIndex))),
      Option.bind('otherTeam', () =>
        pipe(teams, ReadonlyArray.get(otherTeamIndex)),
      ),
      Option.bind('player', ({ team }) =>
        pipe(team, ReadonlyArray.get(playerIndex)),
      ),
      Option.bind('otherPlayer', ({ otherTeam }) =>
        pipe(otherTeam, ReadonlyArray.get(otherPlayerIndex)),
      ),
      Option.let('nextTeam', ({ team, otherPlayer }) =>
        pipe(
          team,
          ReadonlyArray.remove(playerIndex),
          ReadonlyArray.append(otherPlayer),
        ),
      ),
      Option.let('nextOtherTeam', ({ otherTeam, player }) =>
        pipe(
          otherTeam,
          ReadonlyArray.remove(otherPlayerIndex),
          ReadonlyArray.append(player),
        ),
      ),
      Option.flatMap(({ nextTeam, nextOtherTeam }) =>
        pipe(
          teams,
          ReadonlyArray.replaceOption<Array<Player>>(teamIndex, nextTeam),
          Option.flatMap(
            ReadonlyArray.replaceOption<Array<Player>>(
              otherTeamIndex,
              nextOtherTeam,
            ),
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
          ReadonlyArray.splitAt(Math.floor(players.length / numOfTeams)),
          ([as, bs]) =>
            pipe(
              divideTeamsWithEqualNumberOfPlayers(numOfTeams - 1)(bs),
              ReadonlyArray.append(as),
            ),
        )

export const divideTeamsWithFixedNumberOfPlayers =
  (numOfPlayers: number) =>
  (players: Array<Player>): Array<Array<Player>> =>
    players.length === 0
      ? []
      : pipe(players, ReadonlyArray.splitAt(numOfPlayers), ([as, bs]) =>
          pipe(
            divideTeamsWithFixedNumberOfPlayers(numOfPlayers)(bs),
            ReadonlyArray.prepend(as),
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
      ReadonlyArray.getSomes,
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
