import { get } from '@fp-ts/optic'
import { $, $f, A, O, RIO, Rec, S, constant } from 'fp'
import { Player, TeamsGenerator } from 'src/datatypes'
import { root } from 'src/model/Optics'
import { execute, replaceSApp } from 'src/services/StateRef'
import { matchTag } from 'src/utils/Tagged'

export type GeneratedResult = Array<Array<Player>>

export const eraseResult = replaceSApp(root.result.$)(O.none())

export const generateResult = $(
  execute(
    S.gets(s =>
      $(
        get(root.ui.selectedGroupId.$)(s),
        O.flatMap(id => $(get(root.groups.$)(s), Rec.get(id))),
        O.match_(constant([]), g => g.players),
        A.filter(Player.isActive),
        players => ({ players, parameters: get(root.parameters.$)(s) }),
      ),
    ),
  ),
  RIO.chainIOK(({ players, parameters }) =>
    TeamsGenerator.generateRandomBalancedTeams({
      position: parameters.position,
      rating: parameters.rating,
      distribution: $(
        parameters.teamsCountMethod,
        matchTag({
          count: () => ({
            _tag: 'numOfTeams' as const,
            numOfTeams: parameters.teamsCount,
          }),
          playersRequired: () => ({
            _tag: 'fixedNumberOfPlayers' as const,
            fixedNumberOfPlayers: parameters.playersRequired,
          }),
        }),
      ),
    })(players),
  ),
  RIO.chain($f(O.some, replaceSApp(root.result.$), execute)),
)
