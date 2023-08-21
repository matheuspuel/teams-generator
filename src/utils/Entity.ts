import cuid from 'cuid'
import { $, D, F, Effect } from 'fp'

export const Id = $(D.string, D.brand('Id'))
export type Id = D.To<typeof Id>

export const getId: <A extends { id: unknown }>(a: A) => A['id'] = a => a.id

export const getTimestamp: <A extends { timestamp: number }>(
  a: A,
) => number = a => a.timestamp

export const generateId: Effect<never, never, Id> = F.sync(() => cuid() as Id)
