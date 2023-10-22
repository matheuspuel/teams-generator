import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
import { S } from 'fp'
import { Id } from 'src/utils/Entity'
import { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'
import { Position } from './Position'

const refineSync =
  <I, A>(schema: S.Schema<I, A>) =>
  <B extends I>(value: B): A & B => {
    if (S.is(schema)(value)) return value
    else {
      // eslint-disable-next-line functional/no-expression-statements
      S.validateSync(schema)(value)
      // eslint-disable-next-line functional/no-throw-statements
      throw new Error('Invalid refinement')
    }
  }

const pos = <const A extends S.Schema.From<typeof Position>>(_: A) =>
  refineSync(Position)(_)

export interface StaticModality extends S.Schema.To<typeof StaticModality_> {}
const StaticModality_ = S.struct({
  _tag: S.literal('StaticModality'),
  id: NonEmptyString,
  name: NonEmptyString,
  positions: S.nonEmptyArray(Position),
})
export const StaticModality: S.Schema<
  S.Schema.From<typeof StaticModality_>,
  StaticModality
> = StaticModality_

export const soccer = refineSync(StaticModality)({
  _tag: 'StaticModality',
  id: 'soccer',
  name: 'Futebol',
  positions: [
    pos({ abbreviation: 'g', name: 'Goleiro' }),
    pos({ abbreviation: 'z', name: 'Zagueiro' }),
    pos({ abbreviation: 'le', name: 'Lateral Esquerdo' }),
    pos({ abbreviation: 'ld', name: 'Lateral Direito' }),
    pos({ abbreviation: 'v', name: 'Volante' }),
    pos({ abbreviation: 'm', name: 'Meia' }),
    pos({ abbreviation: 'a', name: 'Atacante' }),
  ],
} as const)

export const indoorSoccer = refineSync(StaticModality)({
  _tag: 'StaticModality',
  id: 'indoorSoccer',
  name: 'Futsal',
  positions: [
    pos({ abbreviation: 'g', name: 'Goleiro' }),
    pos({ abbreviation: 'f', name: 'Fixo' }),
    pos({ abbreviation: 'ae', name: 'Ala Esquerdo' }),
    pos({ abbreviation: 'ad', name: 'Ala Direito' }),
    pos({ abbreviation: 'p', name: 'Pivô' }),
  ],
} as const)

export const volleyball = refineSync(StaticModality)({
  _tag: 'StaticModality',
  id: 'volleyball',
  name: 'Vôlei',
  positions: [
    pos({ abbreviation: 'l', name: 'Levantador' }),
    pos({ abbreviation: 'p', name: 'Ponteiro' }),
    pos({ abbreviation: 'o', name: 'Oposto' }),
    pos({ abbreviation: 'c', name: 'Central' }),
    pos({ abbreviation: 'li', name: 'Líbero' }),
  ],
} as const)

export const basketball = refineSync(StaticModality)({
  _tag: 'StaticModality',
  id: 'basketball',
  name: 'Basquete',
  positions: [
    pos({ abbreviation: 'pg', name: 'Point Guard' }),
    pos({ abbreviation: 'sg', name: 'Shooting Guard' }),
    pos({ abbreviation: 'sf', name: 'Small Forward' }),
    pos({ abbreviation: 'pf', name: 'Power Forward' }),
    pos({ abbreviation: 'c', name: 'Center' }),
  ],
} as const)

export const staticModalities: NonEmptyReadonlyArray<StaticModality> = [
  soccer,
  indoorSoccer,
  volleyball,
  basketball,
]

export interface CustomModality extends S.Schema.To<typeof CustomModality_> {}
const CustomModality_ = S.struct({
  _tag: S.literal('CustomModality'),
  id: Id,
  name: NonEmptyString,
  positions: S.nonEmptyArray(Position),
})
export const CustomModality: S.Schema<
  S.Schema.From<typeof CustomModality_>,
  CustomModality
> = CustomModality_

export type Modality = StaticModality | CustomModality

export type Reference = S.Schema.To<typeof Reference_>
const Reference_ = S.union(
  S.struct({ _tag: S.literal('StaticModality'), id: NonEmptyString }),
  S.struct({ _tag: S.literal('CustomModality'), id: Id }),
)
export const Reference: S.Schema<
  S.Schema.From<typeof Reference_>,
  Reference
> = Reference_
