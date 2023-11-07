import { currentTimeMillis as currentTimeMillis_ } from 'effect/Clock'
import { Effect } from 'effect/Effect'
import { Timestamp } from '../datatypes'

export * from 'effect/Clock'

export const currentTimeMillis = currentTimeMillis_ as Effect<
  never,
  never,
  Timestamp
>
