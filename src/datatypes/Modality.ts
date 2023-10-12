import { Id } from 'src/utils/Entity'
import { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'
import { S } from 'src/utils/fp'
import { Position } from './Position'

export interface Modality extends S.Schema.To<typeof Modality_> {}
const Modality_ = S.struct({
  id: Id,
  name: NonEmptyString,
  positions: S.nonEmptyArray(Position),
})
export const Modality: S.Schema<
  S.Schema.From<typeof Modality_>,
  Modality
> = Modality_
