import { Number, Order, Schema } from 'effect'

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

const MINIMUM_NUMBER_OF_TEAMS = 2

export const teamsCountClamp = Order.clamp(Number.Order)({
  minimum: MINIMUM_NUMBER_OF_TEAMS,
  maximum: 99,
})

export const playersRequiredClamp = Order.clamp(Number.Order)({
  minimum: 2,
  maximum: 99,
})
