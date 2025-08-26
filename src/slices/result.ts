import { Array, Effect, Match, Option, Record, pipe } from 'effect'
import { Player, TeamsGenerator } from 'src/datatypes'
import { root } from 'src/model/optic'
import { State, StateRef } from 'src/services/StateRef'
import { getModality } from './groups'

export type GeneratedResult = Array<Array<Player>>

export const eraseResult = State.on(root.at('result')).set(Option.none())

export const generateResult = Effect.gen(function* () {
  const state = yield* StateRef.get
  const group = yield* Option.flatMap(state.ui.selectedGroupId, id =>
    Record.get(state.groups, id),
  )
  const players = Array.filter(group.players, Player.isActive)
  const modality = yield* getModality(group.modality)(state)
  const parameters = state.parameters
  const result = yield* TeamsGenerator.generateRandomBalancedTeams({
    players,
    modality,
    criteria: {
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
    },
  })
  yield* State.on(root.at('result'))
    .set(Option.some(result))
    .pipe(StateRef.execute)
  return result
})
