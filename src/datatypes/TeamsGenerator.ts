import { sumAll } from '@effect/data/Number'
import { Effect } from '@effect/io/Effect'
import {
  $,
  $f,
  A,
  Eff,
  Match,
  Num,
  O,
  Ord,
  Order,
  Rec,
  Tup,
  none,
  some,
} from 'fp'
import * as Player from 'src/datatypes/Player'
import * as Position from 'src/datatypes/Position'
import { findFirstMapWithIndex } from 'src/utils/Array'
import { randomizeArray } from 'src/utils/Random'

type Player = Player.Player
type Position = Position.Position

const getFitOrdByDevianceFns = (
  fns: Array<(teams: Array<Array<Player>>) => number>,
): Order<Array<Array<Player>>> =>
  $(
    fns,
    A.map(f => Ord.mapInput(f)(Num.Order)),
    Ord.combineAll<Array<Array<Player>>>,
  )

const getResultPositionDeviance = (teams: Array<Array<Player>>): number =>
  $(teams, A.flatten, allPlayers =>
    $(
      Position.Dict,
      Rec.toEntries,
      A.map(Tup.getFirst),
      A.map(pos =>
        $(
          allPlayers,
          positionCount(pos),
          n => n / teams.length,
          positionAvg =>
            $(
              teams,
              A.map($f(positionCount(pos), deviance(positionAvg))),
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
  $(teams, A.flatten, Player.getRatingAvg, overallAvg =>
    $(
      teams,
      A.map($f(Player.getRatingAvg, deviance(overallAvg))),
      sumAll,
      fixFloat,
    ),
  )

const balanceTeams: (
  fitOrd: Order<Array<Array<Player>>>,
) => (teams: Array<Array<Player>>) => Array<Array<Player>> = fitOrd => teams =>
  $(
    teams,
    findFirstMapWithIndex((i, team) =>
      $(
        teams,
        findFirstMapWithIndex((j, otherTeam) =>
          j > i
            ? $(
                team,
                findFirstMapWithIndex(k =>
                  $(
                    otherTeam,
                    findFirstMapWithIndex(l =>
                      $(changePlayers(i)(k)(j)(l)(teams), nextState =>
                        Ord.lt(fitOrd)(teams)(nextState)
                          ? some(balanceTeams(fitOrd)(nextState))
                          : none(),
                      ),
                    ),
                  ),
                ),
              )
            : none(),
        ),
      ),
    ),
    O.getOrElse(() => teams),
  )

const deviance = (b: number) => (a: number) => Math.pow(Math.abs(a - b), 2)

const positionCount =
  (position: Position) =>
  (players: Array<Player>): number =>
    $(
      players,
      A.filter(p => p.position === position),
      A.length,
    )

const changePlayers =
  (teamIndex: number) =>
  (playerIndex: number) =>
  (otherTeamIndex: number) =>
  (otherPlayerIndex: number) =>
  (teams: Array<Array<Player>>): Array<Array<Player>> =>
    $(
      O.Do,
      O.bind('team', () => $(teams, A.get(teamIndex))),
      O.bind('otherTeam', () => $(teams, A.get(otherTeamIndex))),
      O.bind('player', ({ team }) => $(team, A.get(playerIndex))),
      O.bind('otherPlayer', ({ otherTeam }) =>
        $(otherTeam, A.get(otherPlayerIndex)),
      ),
      O.let('nextTeam', ({ team, otherPlayer }) =>
        $(team, A.remove(playerIndex), A.append(otherPlayer)),
      ),
      O.let('nextOtherTeam', ({ otherTeam, player }) =>
        $(otherTeam, A.remove(otherPlayerIndex), A.append(player)),
      ),
      O.flatMap(({ nextTeam, nextOtherTeam }) =>
        $(
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
      : $(
          players,
          A.splitAt(Math.floor(players.length / numOfTeams)),
          ([as, bs]) =>
            $(
              divideTeamsWithEqualNumberOfPlayers(numOfTeams - 1)(bs),
              A.append(as),
            ),
        )

export const divideTeamsWithFixedNumberOfPlayers =
  (numOfPlayers: number) =>
  (players: Array<Player>): Array<Array<Player>> =>
    players.length === 0
      ? []
      : $(players, A.splitAt(numOfPlayers), ([as, bs]) =>
          $(
            divideTeamsWithFixedNumberOfPlayers(numOfPlayers)(bs),
            A.prepend(as),
          ),
        )

const divideTeams = (criteria: Criteria) =>
  $(
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

export const getFitOrdFromCriteria = (
  criteria: Criteria,
): Order<Array<Array<Player>>> =>
  $(
    [
      criteria.position ? O.some(getResultPositionDeviance) : O.none(),
      criteria.rating ? O.some(getResultRatingDeviance) : O.none(),
    ],
    A.compact,
    getFitOrdByDevianceFns,
  )

export const balanceTeamsByCriteria = $f(getFitOrdFromCriteria, balanceTeams)

export const distributeTeams = (criteria: Criteria) =>
  $f(divideTeams(criteria), balanceTeamsByCriteria(criteria))

export const generateRandomBalancedTeams =
  (criteria: Criteria) =>
  (players: Array<Player>): Effect<never, never, Array<Array<Player>>> =>
    $(randomizeArray(players), Eff.map(distributeTeams(criteria)))
