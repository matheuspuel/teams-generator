import { S, pipe } from 'fp'
import { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'

export const Abbreviation = pipe(
  NonEmptyString,
  S.maxLength(3),
  S.lowercased(),
  S.brand('Abbreviation'),
)
export type Abbreviation = S.Schema.Type<typeof Abbreviation>

export interface StaticPosition extends S.Schema.Type<typeof StaticPosition_> {}
const StaticPosition_ = S.struct({
  abbreviation: Abbreviation,
  abbreviationLabel: S.string,
  name: NonEmptyString,
})
export const StaticPosition: S.Schema<
  StaticPosition,
  S.Schema.Encoded<typeof StaticPosition_>
> = StaticPosition_

export interface CustomPosition extends S.Schema.Type<typeof CustomPosition_> {}
const CustomPosition_ = S.struct({
  abbreviation: Abbreviation,
  name: NonEmptyString,
})
export const CustomPosition: S.Schema<
  CustomPosition,
  S.Schema.Encoded<typeof CustomPosition_>
> = CustomPosition_

export type Position = StaticPosition | CustomPosition

export const toAbbreviationString = (position: Position): string =>
  'abbreviationLabel' in position
    ? position.abbreviationLabel.toUpperCase()
    : position.abbreviation.toUpperCase()
