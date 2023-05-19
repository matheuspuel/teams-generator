import { get } from '@fp-ts/optic'
import { $, $f, O, RA, Rec, RIO, S } from 'fp'
import { Player, TeamsGenerator } from 'src/datatypes'
import { root } from 'src/model/Optics'
import { execute, replaceSApp } from 'src/services/StateRef'

export type GeneratedResult = Array<Array<Player>>

export const eraseResult = replaceSApp(root.result.$)(O.none())

export const generateResult = $(
  execute(
    S.gets(s =>
      $(
        get(root.ui.selectedGroupId.$)(s),
        O.flatMap(id => $(get(root.groups.$)(s), Rec.get(id))),
        O.map(g => g.players),
        O.getOrElse(() => []),
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
    })(parameters.teamsCount)(players),
  ),
  RIO.chain($f(O.some, replaceSApp(root.result.$), execute)),
)
