import { Schema } from '@effect/schema'
import { Order, String, pipe } from 'effect'

export const Id = pipe(Schema.string, Schema.brand('Id'))
export type Id = Schema.Schema.Type<typeof Id>

export const IdOrder: Order.Order<Id> = String.Order

export const getId: <A extends { id: unknown }>(a: A) => A['id'] = a => a.id

export const getTimestamp: <A extends { timestamp: number }>(
  a: A,
) => number = a => a.timestamp
