import { clockWith } from '@effect/io/Effect'
import { get } from '@fp-ts/optic'
import { $, A, F, Match, O, Rec, S, constant } from 'fp'
import { Player, TeamsGenerator } from 'src/datatypes'
import { getResultRatingDeviance } from 'src/datatypes/TeamsGenerator'
import { root } from 'src/model/optic'
import { Metadata } from 'src/services/Metadata'
import { StateRef, replaceSApp } from 'src/services/StateRef'
import { Telemetry } from 'src/services/Telemetry'
import { Timestamp } from 'src/utils/datatypes'

export type GeneratedResult = Array<Array<Player>>

export const eraseResult = replaceSApp(root.at('result'))(O.none())

export const generateResult = $(
  StateRef.modify(
    S.gets(s =>
      $(
        get(root.at('ui').at('selectedGroupId'))(s),
        O.flatMap(id => $(get(root.at('groups'))(s), Rec.get(id))),
        O.match_({ onNone: constant([]), onSome: g => g.players }),
        A.filter(Player.isActive),
        players => ({ players, parameters: get(root.at('parameters'))(s) }),
      ),
    ),
  ),
  F.bind('start', () => clockWith(c => c.currentTimeMillis)),
  F.bind('result', ({ players, parameters }) =>
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
  F.bind('end', () => clockWith(c => c.currentTimeMillis)),
  F.tap(({ result }) =>
    $(result, O.some, replaceSApp(root.at('result')), StateRef.modify),
  ),
  F.tap(({ parameters, players, start, end, result }) =>
    $(
      Metadata.get(),
      F.flatMap(meta =>
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
      F.flatMap(() => Telemetry.send()),
      F.catchAll(() => F.unit),
    ),
  ),
)
