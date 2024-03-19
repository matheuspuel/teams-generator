import { Schema } from '@effect/schema'
import * as Optic from '@fp-ts/optic'
import { Match, pipe } from 'effect'

export type Parameters = {
  teamsCountMethod: { _tag: 'count' } | { _tag: 'playersRequired' }
  teamsCount: number
  playersRequired: number
  position: boolean
  rating: boolean
}

export const SchemaV1 = Schema.struct({
  teamsCount: Schema.number,
  position: Schema.boolean,
  rating: Schema.boolean,
})

export const Parameters: Schema.Schema<Parameters> = Schema.struct({
  teamsCountMethod: Schema.union(
    Schema.struct({ _tag: Schema.literal('count') }),
    Schema.struct({ _tag: Schema.literal('playersRequired') }),
  ),
  teamsCount: Schema.number,
  playersRequired: Schema.number,
  position: Schema.boolean,
  rating: Schema.boolean,
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
