import { Schema } from '@effect/schema'
import { pipe } from 'effect'
import { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'

export const Abbreviation = pipe(
  NonEmptyString,
  Schema.maxLength(3),
  Schema.lowercased(),
  Schema.brand('Abbreviation'),
)
export type Abbreviation = Schema.Schema.Type<typeof Abbreviation>

export interface StaticPosition
  extends Schema.Schema.Type<typeof StaticPosition_> {}
const StaticPosition_ = Schema.Struct({
  abbreviation: Abbreviation,
  abbreviationLabel: Schema.String,
  name: NonEmptyString,
})
export const StaticPosition: Schema.Schema<
  StaticPosition,
  Schema.Schema.Encoded<typeof StaticPosition_>
> = StaticPosition_

export interface CustomPosition
  extends Schema.Schema.Type<typeof CustomPosition_> {}
const CustomPosition_ = Schema.Struct({
  abbreviation: Abbreviation,
  name: NonEmptyString,
})
export const CustomPosition: Schema.Schema<
  CustomPosition,
  Schema.Schema.Encoded<typeof CustomPosition_>
> = CustomPosition_

export type Position = StaticPosition | CustomPosition

export const toAbbreviationString = (position: Position): string =>
  'abbreviationLabel' in position
    ? position.abbreviationLabel.toUpperCase()
    : position.abbreviation.toUpperCase()
