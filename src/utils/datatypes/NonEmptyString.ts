import { Schema } from '@effect/schema'
import { pipe } from 'effect'

export const NonEmptyString = pipe(
  Schema.NonEmptyString,
  Schema.brand('NonEmptyString'),
)
export type NonEmptyString = Schema.Schema.Type<typeof NonEmptyString>
