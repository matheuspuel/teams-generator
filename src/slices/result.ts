import { get } from '@fp-ts/optic'
import { $, $f, O, RA, Rec, RIO, S } from 'fp'
import { Player, TeamsGenerator } from 'src/datatypes'
import { $op } from 'src/model/Optics'
import { execute, replaceSApp } from 'src/services/StateRef'

export type GeneratedResult = Array<Array<Player>>

export const eraseResult = replaceSApp($op.result.$)(O.none)

export const generateResult = $(
  execute(
    S.gets(s =>
      $(
        get($op.ui.selectedGroupId.$)(s),
        O.chain(id => $(get($op.groups.$)(s), Rec.lookup(id))),
        O.map(g => g.players),
        O.getOrElseW(() => []),
        RA.filter(Player.isActive),
        RA.toArray,
        players => ({ players, parameters: get($op.parameters.$)(s) }),
      ),
    ),
  ),
  RIO.chainIOK(({ players, parameters }) =>
    TeamsGenerator.generateRandomBalancedTeams({
      position: parameters.position,
      rating: parameters.rating,
    })(parameters.teamsCount)(players),
  ),
  RIO.chain($f(O.some, replaceSApp($op.result.$), execute)),
)
