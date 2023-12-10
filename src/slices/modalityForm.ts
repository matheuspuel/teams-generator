import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
import { A, E, O, Option, S } from 'fp'
import { Abbreviation } from 'src/datatypes/Position'
import { Id } from 'src/utils/Entity'
import { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'

export type ModalityForm = {
  id: Option<Id>
  name: string
  positions: NonEmptyReadonlyArray<{
    oldAbbreviation: Option<Abbreviation>
    abbreviation: string
    name: string
  }>
}

export const blankPositionForm: ModalityForm['positions'][number] = {
  oldAbbreviation: O.none(),
  abbreviation: '',
  name: '',
}

export const initialModalityForm: ModalityForm = {
  id: O.none(),
  name: '',
  positions: [blankPositionForm],
}

export const validateModalityForm = (f: ModalityForm) =>
  E.all({
    id: E.right(f.id),
    name: S.decodeEither(NonEmptyString)(f.name),
    positions: E.all(
      A.map(f.positions, p =>
        E.all({
          oldAbbreviation: E.right(p.oldAbbreviation),
          abbreviation: S.decodeEither(
            S.Lowercase.pipe(S.compose(Abbreviation)),
          )(p.abbreviation),
          name: S.decodeEither(NonEmptyString)(p.name),
        }).pipe(
          E.map(_ => ({
            ..._,
            abbreviationLabel: _.abbreviation.toUpperCase(),
          })),
        ),
      ),
    ).pipe(
      E.flatMap(ps =>
        ps.every(
          (a, ai) =>
            !ps.some((b, bi) => a.abbreviation === b.abbreviation && ai !== bi),
        )
          ? E.right(ps)
          : E.left('duplicatePositions' as const),
      ),
    ),
  })
