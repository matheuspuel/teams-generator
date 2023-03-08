import { get } from '@fp-ts/optic'
import { $, $f, A, O, Rec, RIO, S } from 'fp'
import { generateRandomBalancedTeams } from 'src/business/distribution'
import { Player, PlayerIsActive } from 'src/datatypes/Player'
import { execute, replaceSApp, RootOptic } from 'src/redux'
import { GroupsLens } from './groups'
import { ParametersLens } from './parameters'
import { UiLens } from './ui'

export const ResultLens = RootOptic.at('result')

export type GeneratedResult = Array<Array<Player>>

export const generateResult = $(
  execute(
    S.gets(s =>
      $(
        get(UiLens.at('selectedGroupId'))(s),
        O.chain(id => $(get(GroupsLens)(s), Rec.lookup(id))),
        O.map(g => g.players),
        O.getOrElseW(() => []),
        A.filter(PlayerIsActive),
        players => ({ players, parameters: get(ParametersLens)(s) }),
      ),
    ),
  ),
  RIO.chainIOK(({ players, parameters }) =>
    generateRandomBalancedTeams({
      position: parameters.position,
      rating: parameters.rating,
    })(parameters.teamsCount)(players),
  ),
  RIO.chain($f(O.some, replaceSApp(ResultLens), execute)),
)
