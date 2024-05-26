import { Array, Effect, Match, Option, Record, pipe } from 'effect'
import { clockWith } from 'effect/Effect'
import { Player, TeamsGenerator } from 'src/datatypes'
import { getResultRatingDeviance } from 'src/datatypes/TeamsGenerator'
import { root } from 'src/model/optic'
import { MetadataService } from 'src/services/Metadata'
import { State, StateRef } from 'src/services/StateRef'
import { Telemetry } from 'src/services/Telemetry'
import { Timestamp } from 'src/utils/datatypes'
import { getModality } from './groups'

export type GeneratedResult = Array<Array<Player>>

export const eraseResult = State.on(root.at('result')).set(Option.none())

export const generateResult = pipe(
  State.get.pipe(
    Effect.flatMap(s =>
      Option.flatMap(s.ui.selectedGroupId, id => Record.get(s.groups, id)),
    ),
  ),
  Effect.flatMap(group =>
    Effect.all({
      players: Effect.succeed(Array.filter(group.players, Player.isActive)),
      modality: State.flatWith(getModality(group.modality)),
      parameters: State.with(s => s.parameters),
      start: clockWith(c => c.currentTimeMillis),
    }),
  ),
  StateRef.execute,
  Effect.bind('result', ({ players, parameters, modality }) =>
    TeamsGenerator.generateRandomBalancedTeams({ modality })({
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
  Effect.bind('end', () => clockWith(c => c.currentTimeMillis)),
  Effect.tap(({ result }) =>
    pipe(
      result,
      Option.some,
      State.on(root.at('result')).set,
      StateRef.execute,
    ),
  ),
  Effect.tap(({ parameters, players, start, end, result }) =>
    pipe(
      MetadataService.get(),
      Effect.flatMap(meta =>
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
      Effect.flatMap(() => Telemetry.send()),
      Effect.ignore,
    ),
  ),
)
