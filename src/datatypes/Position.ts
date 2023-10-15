import { S, pipe } from 'fp'
import { Id } from 'src/utils/Entity'
import { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'

export const Abbreviation = pipe(
  NonEmptyString,
  S.maxLength(3),
  S.lowercased(),
  S.brand('Abbreviation'),
)
export type Abbreviation = S.Schema.To<typeof Abbreviation>

export interface Position extends S.Schema.To<typeof Position_> {}
const Position_ = S.struct({
  id: Id,
  abbreviation: Abbreviation,
  name: NonEmptyString,
})
export const Position: S.Schema<
  S.Schema.From<typeof Position_>,
  Position
> = Position_

export const toAbbreviationString = (position: Position): string =>
  position.abbreviation.toUpperCase()
