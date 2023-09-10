import { D, Endomorphism, Match, Optic, pipe } from 'fp'

export type Parameters = {
  teamsCountMethod: { _tag: 'count' } | { _tag: 'playersRequired' }
  teamsCount: number
  playersRequired: number
  position: boolean
  rating: boolean
}

export const SchemaV1 = D.struct({
  teamsCount: D.number,
  position: D.boolean,
  rating: D.boolean,
})

export const Schema: D.Schema<Parameters> = D.struct({
  teamsCountMethod: D.union(
    D.struct({ _tag: D.literal('count') }),
    D.struct({ _tag: D.literal('playersRequired') }),
  ),
  teamsCount: D.number,
  playersRequired: D.number,
  position: D.boolean,
  rating: D.boolean,
})

export const Parameters = Schema

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

export const toggleType: Endomorphism<Parameters> = Optic.modify(
  Optic.id<Parameters>().at('teamsCountMethod'),
)(
  Match.valueTags({
    count: () => ({ _tag: 'playersRequired' as const }),
    playersRequired: () => ({ _tag: 'count' as const }),
  }),
)
