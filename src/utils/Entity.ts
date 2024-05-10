import { Schema } from '@effect/schema'
import { pipe } from 'effect'

export const Id = pipe(Schema.String, Schema.brand('Id'))
export type Id = Schema.Schema.Type<typeof Id>
