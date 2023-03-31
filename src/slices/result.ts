import { get } from '@fp-ts/optic'
import { $, $f, O, RA, Rec, RIO, S } from 'fp'
import { Player, TeamsGenerator } from 'src/datatypes'
import { execute, replaceSApp } from 'src/services/StateRef'
import { RootOptic } from '.'
import { GroupsLens } from './groups'
import { ParametersLens } from './parameters'
import { UiLens } from './ui'

export const ResultLens = RootOptic.at('result')

export type GeneratedResult = Array<Array<Player>>

export const eraseResult = replaceSApp(ResultLens)(O.none)

export const generateResult = $(
  execute(
    S.gets(s =>
      $(
        get(UiLens.at('selectedGroupId'))(s),
        O.chain(id => $(get(GroupsLens)(s), Rec.lookup(id))),
        O.map(g => g.players),
        O.getOrElseW(() => []),
        RA.filter(Player.isActive),
        RA.toArray,
        players => ({ players, parameters: get(ParametersLens)(s) }),
      ),
    ),
  ),
  RIO.chainIOK(({ players, parameters }) =>
    TeamsGenerator.generateRandomBalancedTeams({
      position: parameters.position,
      rating: parameters.rating,
    })(parameters.teamsCount)(players),
  ),
  RIO.chain($f(O.some, replaceSApp(ResultLens), execute)),
)
