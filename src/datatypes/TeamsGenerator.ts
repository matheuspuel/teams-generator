import {
  Array,
  Effect,
  Iterable,
  Match,
  Number,
  Option,
  Order,
  Tuple,
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

const balanceTeams = (args: {
  teams: Array<Array<Player>>
  fitOrder: Order.Order<Array<Array<Player>>>
}): Effect.Effect<Array<Array<Player>>> =>
  Effect.sync(() => {
    const isMoreBalanced = Order.lessThan(args.fitOrder)
    let teams = args.teams
    // eslint-disable-next-line no-constant-condition
    repeatTryingAllPossibleSimpleChanges: while (true) {
      for (const [team1, team1Index] of Iterable.map(teams, Tuple.make)) {
        for (const [team2, team2Index] of Iterable.map(teams, Tuple.make)) {
          if (team2Index <= team1Index) continue
          for (const player1Index of Iterable.map(team1, (_, i) => i)) {
            for (const player2Index of Iterable.map(team2, (_, i) => i)) {
              const changedTeams = changePlayers(
                { teamIndex: team1Index, playerIndex: player1Index },
                { teamIndex: team2Index, playerIndex: player2Index },
              )(teams)
              if (isMoreBalanced(changedTeams, teams)) {
                teams = changedTeams
                continue repeatTryingAllPossibleSimpleChanges
              }
            }
          }
        }
      }
      break
    }
    return teams
  })

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
  (
    first: { teamIndex: number; playerIndex: number },
    second: { teamIndex: number; playerIndex: number },
  ) =>
  (teams: Array<Array<Player>>): Array<Array<Player>> =>
    Option.gen(function* () {
      const firstTeam = yield* Array.get(teams, first.teamIndex)
      const secondTeam = yield* Array.get(teams, second.teamIndex)
      const firstPlayer = yield* Array.get(firstTeam, first.playerIndex)
      const secondPlayer = yield* Array.get(secondTeam, second.playerIndex)
      const nextFirstTeam = pipe(
        firstTeam,
        Array.remove(first.playerIndex),
        Array.append(secondPlayer),
      )
      const nextSecondTeam = pipe(
        secondTeam,
        Array.remove(second.playerIndex),
        Array.append(firstPlayer),
      )
      return yield* pipe(
        teams,
        Array.replaceOption<Array<Player>>(first.teamIndex, nextFirstTeam),
        Option.flatMap(
          Array.replaceOption<Array<Player>>(second.teamIndex, nextSecondTeam),
        ),
      )
    }).pipe(Option.getOrElse(() => teams))

export const divideTeamsWithEqualNumberOfPlayers = (args: {
  players: Array<Player>
  numOfTeams: number
}): Array<Array<Player>> =>
  args.numOfTeams <= 0
    ? []
    : pipe(
        args.players,
        Array.splitAt(Math.floor(args.players.length / args.numOfTeams)),
        ([as, bs]) =>
          pipe(
            divideTeamsWithEqualNumberOfPlayers({
              players: bs,
              numOfTeams: args.numOfTeams - 1,
            }),
            Array.append(as),
          ),
      )

export const divideTeamsWithFixedNumberOfPlayers = (args: {
  players: Array<Player>
  numOfPlayers: number
}): Array<Array<Player>> =>
  args.players.length === 0
    ? []
    : pipe(args.players, Array.splitAt(args.numOfPlayers), ([as, bs]) =>
        pipe(
          divideTeamsWithFixedNumberOfPlayers({
            players: bs,
            numOfPlayers: args.numOfPlayers,
          }),
          Array.prepend(as),
        ),
      )

const divideTeams = (args: { players: Array<Player>; criteria: Criteria }) =>
  Match.valueTags(args.criteria.distribution, {
    numOfTeams: ({ numOfTeams }) =>
      divideTeamsWithEqualNumberOfPlayers({
        players: args.players,
        numOfTeams,
      }),
    fixedNumberOfPlayers: ({ fixedNumberOfPlayers }) =>
      divideTeamsWithFixedNumberOfPlayers({
        players: args.players,
        numOfPlayers: fixedNumberOfPlayers,
      }),
  })

export type Criteria = {
  position: boolean
  rating: boolean
  distribution:
    | { _tag: 'numOfTeams'; numOfTeams: number }
    | { _tag: 'fixedNumberOfPlayers'; fixedNumberOfPlayers: number }
}

export const getFitOrdFromCriteria = (args: {
  modality: Modality
  criteria: Criteria
}): Order.Order<Array<Array<Player>>> =>
  pipe(
    [
      args.criteria.position
        ? Option.some(getResultPositionDeviance(args))
        : Option.none(),
      args.criteria.rating
        ? Option.some(getResultRatingDeviance)
        : Option.none(),
    ],
    Array.getSomes,
    getFitOrdByDevianceFns,
  )

export const balanceTeamsByCriteria = (args: {
  teams: Array<Array<Player>>
  modality: Modality
  criteria: Criteria
}) => balanceTeams({ teams: args.teams, fitOrder: getFitOrdFromCriteria(args) })

export const distributeTeams = (args: {
  players: Array<Player>
  modality: Modality
  criteria: Criteria
}) => balanceTeamsByCriteria({ ...args, teams: divideTeams(args) })

export const generateRandomBalancedTeams = (args: {
  players: Array<Player>
  modality: Modality
  criteria: Criteria
}): Effect.Effect<Array<Array<Player>>> =>
  Effect.gen(function* () {
    return yield* distributeTeams({
      ...args,
      players: yield* randomizeArray(args.players),
    })
  })
