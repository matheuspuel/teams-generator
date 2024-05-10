import { Schema } from '@effect/schema'
import * as Optic from '@fp-ts/optic'
import { Match, pipe } from 'effect'

export class Parameters extends Schema.Class<Parameters>('Parameters')({
  teamsCountMethod: Schema.Union(
    Schema.Struct({ _tag: Schema.Literal('count') }),
    Schema.Struct({ _tag: Schema.Literal('playersRequired') }),
  ),
  teamsCount: Schema.Number,
  playersRequired: Schema.Number,
  position: Schema.Boolean,
  rating: Schema.Boolean,
}) {}

export const SchemaV1 = Schema.Struct({
  teamsCount: Schema.Number,
  position: Schema.Boolean,
  rating: Schema.Boolean,
})

export const initial: Parameters = {
  teamsCountMethod: { _tag: 'count' },
  teamsCount: 2,
  playersRequired: 11,
  position: true,
  rating: true,
}

export const MINIMUM_NUMBER_OF_TEAMS = 2

export const numOfTeams = (numOfPlayersAvailable: number) => (p: Parameters) =>
  pipe(
    p.teamsCountMethod,
    Match.valueTags({
      count: () => p.teamsCount,
      playersRequired: () =>
        Math.max(
          MINIMUM_NUMBER_OF_TEAMS,
          Math.floor(numOfPlayersAvailable / p.playersRequired),
        ),
    }),
  )

export const toggleType: (_: Parameters) => Parameters = Optic.modify(
  Optic.id<Parameters>().at('teamsCountMethod'),
)(
  Match.valueTags({
    count: () => ({ _tag: 'playersRequired' as const }),
    playersRequired: () => ({ _tag: 'count' as const }),
  }),
)
