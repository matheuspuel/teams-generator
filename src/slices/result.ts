import { get } from '@fp-ts/optic'
import { clockWith } from 'effect/Effect'
import { A, F, Match, O, Record, constant, pipe } from 'fp'
import { Player, TeamsGenerator } from 'src/datatypes'
import { getResultRatingDeviance } from 'src/datatypes/TeamsGenerator'
import { root } from 'src/model/optic'
import { Metadata } from 'src/services/Metadata'
import { State, StateRef } from 'src/services/StateRef'
import { Telemetry } from 'src/services/Telemetry'
import { Timestamp } from 'src/utils/datatypes'

export type GeneratedResult = Array<Array<Player>>

export const eraseResult = State.on(root.at('result')).set(O.none())

export const generateResult = pipe(
  StateRef.query(State.get),
  F.map(s =>
    pipe(
      get(root.at('ui').at('selectedGroupId'))(s),
      O.flatMap(id => pipe(get(root.at('groups'))(s), Record.get(id))),
      O.match_({ onNone: constant([]), onSome: g => g.players }),
      A.filter(Player.isActive),
      players => ({ players, parameters: get(root.at('parameters'))(s) }),
    ),
  ),
  F.bind('start', () => clockWith(c => c.currentTimeMillis)),
  F.bind('result', ({ players, parameters }) =>
    TeamsGenerator.generateRandomBalancedTeams({
      position: parameters.position,
      rating: parameters.rating,
      distribution: pipe(
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
    pipe(result, O.some, State.on(root.at('result')).set, StateRef.execute),
  ),
  F.tap(({ parameters, players, start, end, result }) =>
    pipe(
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
      F.ignore,
    ),
  ),
)
