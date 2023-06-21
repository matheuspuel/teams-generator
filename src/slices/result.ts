import { clockWith } from '@effect/io/Effect'
import { get } from '@fp-ts/optic'
import { $, A, Eff, Match, O, Rec, S, constant } from 'fp'
import { Player, TeamsGenerator } from 'src/datatypes'
import { getResultRatingDeviance } from 'src/datatypes/TeamsGenerator'
import { root } from 'src/model/Optics'
import { Metadata } from 'src/services/Metadata'
import { execute, replaceSApp } from 'src/services/StateRef'
import { Telemetry } from 'src/services/Telemetry'
import { Timestamp } from 'src/utils/datatypes'

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
  Eff.bind('start', () => clockWith(c => c.currentTimeMillis())),
  Eff.bind('result', ({ players, parameters }) =>
    TeamsGenerator.generateRandomBalancedTeams({
      position: parameters.position,
      rating: parameters.rating,
      distribution: $(
        parameters.teamsCountMethod,
        Match.valueTags({
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
  Eff.bind('end', () => clockWith(c => c.currentTimeMillis())),
  Eff.tap(({ result }) =>
    $(result, O.some, replaceSApp(root.result.$), execute),
  ),
  Eff.tap(({ parameters, players, start, end, result }) =>
    $(
      Metadata.get,
      Eff.flatMap(meta =>
        Telemetry.log([
          {
            timestamp: end as Timestamp,
            event: 'generateRandomBalancedTeams',
            data: {
              parameters,
              playerCount: players.length,
              deviance: getResultRatingDeviance(result),
              duration: end - start,
              metadata: {
                installation: meta.installation,
                launch: meta.launch,
              },
            },
          },
        ]),
      ),
      Eff.flatMap(() => Telemetry.send),
      Eff.catchAll(() => Eff.unit()),
    ),
  ),
)
