import { S, pipe } from 'fp'

export const Id = pipe(S.string, S.brand('Id'))
export type Id = S.Schema.To<typeof Id>

export const getId: <A extends { id: unknown }>(a: A) => A['id'] = a => a.id

export const getTimestamp: <A extends { timestamp: number }>(
  a: A,
) => number = a => a.timestamp
