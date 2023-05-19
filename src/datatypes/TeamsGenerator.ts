import { $, $f, A, IO, Num, O, Ord, Order, Rec, Tup, none, some } from 'fp'
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
    A.map(f => Ord.contramap(f)(Num.Order)),
    Ord.getMonoid<Array<Array<Player>>>().combineAll,
  )

const getResultPositionDeviance = (teams: Array<Array<Player>>): number =>
  $(teams, A.flatten, allPlayers =>
    $(
      Position.Dict,
      Rec.toEntries,
      A.map(Tup.getFirst),
      A.combineMap(Num.MonoidSum)(pos =>
        $(
          allPlayers,
          positionCount(pos),
          n => n / teams.length,
          positionAvg =>
            $(
              teams,
              A.combineMap(Num.MonoidSum)(
                $f(positionCount(pos), deviance(positionAvg)),
              ),
            ),
        ),
      ),
    ),
  )

const fixFloatFactor = 1000000000000

const fixFloat = (v: number) => Math.round(v * fixFloatFactor) / fixFloatFactor

const getResultRatingDeviance = (teams: Array<Array<Player>>): number =>
  $(teams, A.flatten, Player.getRatingAvg, overallAvg =>
    $(
      teams,
      A.combineMap(Num.MonoidSum)(
        $f(Player.getRatingAvg, deviance(overallAvg)),
      ),
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
      O.Do(),
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

export const divideTeams =
  (numOfTeams: number) =>
  (players: Array<Player>): Array<Array<Player>> =>
    numOfTeams <= 0
      ? []
      : $(
          players,
          A.splitAt(Math.floor(players.length / numOfTeams)),
          ([as, bs]) => $(divideTeams(numOfTeams - 1)(bs), A.append(as)),
        )

export const balanceTeamsByFitOrd =
  (fitOrd: Order<Array<Array<Player>>>) =>
  (numOfTeams: number) =>
  (players: Array<Player>): Array<Array<Player>> =>
    $(players, divideTeams(numOfTeams), balanceTeams(fitOrd))

export type Criteria = {
  position: boolean
  rating: boolean
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

export const balanceTeamsByCriteria = $f(
  getFitOrdFromCriteria,
  balanceTeamsByFitOrd,
)

export const generateRandomBalancedTeams =
  (criteria: Criteria) =>
  (numOfTeams: number) =>
  (players: Array<Player>): IO<Array<Array<Player>>> =>
    $(
      randomizeArray(players),
      IO.map(balanceTeamsByCriteria(criteria)(numOfTeams)),
    )
