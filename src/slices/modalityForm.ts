import { Schema } from '@effect/schema'
import { Either, Option, ReadonlyArray } from 'effect'
import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
import { Abbreviation } from 'src/datatypes/Position'
import { Id } from 'src/utils/Entity'
import { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'

export type ModalityForm = {
  id: Option.Option<Id>
  name: string
  positions: NonEmptyReadonlyArray<{
    oldAbbreviation: Option.Option<Abbreviation>
    abbreviation: string
    name: string
  }>
}

export const blankPositionForm: ModalityForm['positions'][number] = {
  oldAbbreviation: Option.none(),
  abbreviation: '',
  name: '',
}

export const initialModalityForm: ModalityForm = {
  id: Option.none(),
  name: '',
  positions: [blankPositionForm],
}

export const validateModalityForm = (f: ModalityForm) =>
  Either.all({
    id: Either.right(f.id),
    name: Schema.decodeEither(NonEmptyString)(f.name),
    positions: Either.all(
      ReadonlyArray.map(f.positions, p =>
        Either.all({
          oldAbbreviation: Either.right(p.oldAbbreviation),
          abbreviation: Schema.decodeEither(
            Schema.Lowercase.pipe(Schema.compose(Abbreviation)),
          )(p.abbreviation),
          name: Schema.decodeEither(NonEmptyString)(p.name),
        }).pipe(
          Either.map(_ => ({
            ..._,
            abbreviationLabel: _.abbreviation.toUpperCase(),
          })),
        ),
      ),
    ).pipe(
      Either.flatMap(ps =>
        ps.every(
          (a, ai) =>
            !ps.some((b, bi) => a.abbreviation === b.abbreviation && ai !== bi),
        )
          ? Either.right(ps)
          : Either.left('duplicatePositions' as const),
      ),
    ),
  })
