import { $, $f, A, IO, none, Num, O, Ord, Rec, some, Tup } from 'fp'
import * as Monoid from 'fp-ts/Monoid'
import * as Player from 'src/datatypes/Player'
import * as Position from 'src/datatypes/Position'
import { findFirstMapWithIndex } from 'src/utils/Array'
import { randomizeArray } from 'src/utils/Random'

type Player = Player.Player
type Position = Position.Position

const getFitOrdByDevianceFns = (
  fns: Array<(teams: Array<Array<Player>>) => number>,
): Ord<Array<Array<Player>>> =>
  $(
    fns,
    A.map(f => Ord.contramap(f)(Num.Ord)),
    Monoid.concatAll(Ord.getMonoid<Array<Array<Player>>>()),
  )

const getResultPositionDeviance = (teams: Array<Array<Player>>): number =>
  $(teams, A.flatten, allPlayers =>
    $(
      Position.Dict,
      Rec.toEntries,
      A.map(Tup.fst),
      A.foldMap(Num.MonoidSum)(pos =>
        $(
          allPlayers,
          positionCount(pos),
          n => n / teams.length,
          positionAvg =>
            $(
              teams,
              A.foldMap(Num.MonoidSum)(
                $f(positionCount(pos), deviance(positionAvg)),
              ),
            ),
        ),
      ),
    ),
  )

const getResultRatingDeviance = (teams: Array<Array<Player>>): number =>
  $(teams, A.flatten, Player.getRatingAvg, overallAvg =>
    $(
      teams,
      A.foldMap(Num.MonoidSum)($f(Player.getRatingAvg, deviance(overallAvg))),
    ),
  )

const balanceTeams: (
  fitOrd: Ord<Array<Array<Player>>>,
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
    $(
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
    $(
      O.Do,
      O.apS('team', $(teams, A.lookup(teamIndex))),
      O.apS('otherTeam', $(teams, A.lookup(otherTeamIndex))),
      O.bind('player', ({ team }) => $(team, A.lookup(playerIndex))),
      O.bind('otherPlayer', ({ otherTeam }) =>
        $(otherTeam, A.lookup(otherPlayerIndex)),
      ),
      O.bind('nextTeam', ({ team, otherPlayer }) =>
        $(team, A.deleteAt(playerIndex), O.map(A.append(otherPlayer))),
      ),
      O.bind('nextOtherTeam', ({ otherTeam, player }) =>
        $(otherTeam, A.deleteAt(otherPlayerIndex), O.map(A.append(player))),
      ),
      O.chain(({ nextTeam, nextOtherTeam }) =>
        $(
          teams,
          A.updateAt<Array<Player>>(teamIndex, nextTeam),
          O.chain(A.updateAt<Array<Player>>(otherTeamIndex, nextOtherTeam)),
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
          ([as, bs]) => $(divideTeams(numOfTeams - 1)(bs), A.appendW(as)),
        )

export const balanceTeamsByFitOrd =
  (fitOrd: Ord<Array<Array<Player>>>) =>
  (numOfTeams: number) =>
  (players: Array<Player>): Array<Array<Player>> =>
    $(players, divideTeams(numOfTeams), balanceTeams(fitOrd))

export type Criteria = {
  position: boolean
  rating: boolean
}

export const getFitOrdFromCriteria = (
  criteria: Criteria,
): Ord<Array<Array<Player>>> =>
  $(
    [
      A.fromPredicate(() => criteria.position)(getResultPositionDeviance),
      A.fromPredicate(() => criteria.rating)(getResultRatingDeviance),
    ],
    Monoid.concatAll(A.getMonoid()),
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
