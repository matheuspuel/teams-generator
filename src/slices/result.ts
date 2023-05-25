import { get } from '@fp-ts/optic'
import { $, $f, O, RA, Rec, RIO, S } from 'fp'
import { Player, TeamsGenerator } from 'src/datatypes'
import { numOfTeams } from 'src/datatypes/Parameters'
import { root } from 'src/model/Optics'
import { execute, replaceSApp } from 'src/services/StateRef'

export type GeneratedResult = Array<Array<Player>>

export const eraseResult = replaceSApp(root.result.$)(O.none)

export const generateResult = $(
  execute(
    S.gets(s =>
      $(
        get(root.ui.selectedGroupId.$)(s),
        O.chain(id => $(get(root.groups.$)(s), Rec.lookup(id))),
        O.map(g => g.players),
        O.getOrElseW(() => []),
        RA.filter(Player.isActive),
        RA.toArray,
        players => ({ players, parameters: get(root.parameters.$)(s) }),
      ),
    ),
  ),
  RIO.chainIOK(({ players, parameters }) =>
    TeamsGenerator.generateRandomBalancedTeams({
      position: parameters.position,
      rating: parameters.rating,
    })(numOfTeams(players.length)(parameters))(players),
  ),
  RIO.chain($f(O.some, replaceSApp(root.result.$), execute)),
)
