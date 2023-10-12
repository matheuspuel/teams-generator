import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
import { A, E, O, Option, S } from 'fp'
import { Abbreviation } from 'src/datatypes/Position'
import { Id } from 'src/utils/Entity'
import { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'

export type ModalityForm = {
  id: Option<Id>
  name: string
  positions: NonEmptyReadonlyArray<{
    id: Option<Id>
    abbreviation: string
    name: string
  }>
}

export const blankPositionForm: ModalityForm['positions'][number] = {
  id: O.none(),
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
      A.mapNonEmpty(f.positions, p =>
        E.all({
          id: E.right(p.id),
          abbreviation: S.decodeEither(
            S.Lowercase.pipe(S.compose(Abbreviation)),
          )(p.abbreviation),
          name: S.decodeEither(NonEmptyString)(p.name),
        }),
      ),
    ),
  })
