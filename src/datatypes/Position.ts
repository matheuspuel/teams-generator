import { pipe, Schema } from 'effect'
import { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'

export const Abbreviation = pipe(
  NonEmptyString,
  Schema.maxLength(3),
  Schema.lowercased(),
  Schema.brand('Abbreviation'),
)
export type Abbreviation = Schema.Schema.Type<typeof Abbreviation>

export class StaticPosition extends Schema.Class<StaticPosition>(
  'StaticPosition',
)({
  abbreviation: Abbreviation,
  abbreviationLabel: Schema.String,
  name: NonEmptyString,
}) {}

export class CustomPosition extends Schema.Class<CustomPosition>(
  'CustomPosition',
)({
  abbreviation: Abbreviation,
  name: NonEmptyString,
}) {}

export type Position = StaticPosition | CustomPosition

export const toAbbreviationString = (position: Position): string =>
  'abbreviationLabel' in position
    ? position.abbreviationLabel.toUpperCase()
    : position.abbreviation.toUpperCase()
