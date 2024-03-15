import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
import { S } from 'fp'
import { t } from 'src/i18n'
import { Id } from 'src/utils/Entity'
import { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'
import { CustomPosition, StaticPosition } from './Position'

const refineSync =
  <A, I>(schema: S.Schema<A, I>) =>
  <B extends I>(value: B): A & B => {
    if (S.is(schema)(value)) return value
    else {
      // eslint-disable-next-line functional/no-expression-statements
      S.validateSync(schema)(value)
      // eslint-disable-next-line functional/no-throw-statements
      throw new Error('Invalid refinement')
    }
  }

const pos = <const A extends S.Schema.Encoded<typeof StaticPosition>>(_: A) =>
  refineSync(StaticPosition)(_)

export interface StaticModality extends S.Schema.Type<typeof StaticModality_> {}
const StaticModality_ = S.struct({
  _tag: S.literal('StaticModality'),
  id: NonEmptyString,
  name: NonEmptyString,
  positions: S.nonEmptyArray(StaticPosition),
})
export const StaticModality: S.Schema<
  StaticModality,
  S.Schema.Encoded<typeof StaticModality_>
> = StaticModality_

export const soccer = refineSync(StaticModality)({
  _tag: 'StaticModality',
  id: 'soccer',
  name: t('Soccer'),
  positions: [
    pos({
      abbreviation: 'g',
      abbreviationLabel: t('Goalkeeper(abv)'),
      name: t('Goalkeeper'),
    }),
    pos({
      abbreviation: 'z',
      abbreviationLabel: t('Center Back(abv)'),
      name: t('Center Back'),
    }),
    pos({
      abbreviation: 'le',
      abbreviationLabel: t('Left Back(abv)'),
      name: t('Left Back'),
    }),
    pos({
      abbreviation: 'ld',
      abbreviationLabel: t('Right Back(abv)'),
      name: t('Right Back'),
    }),
    pos({
      abbreviation: 'v',
      abbreviationLabel: t('Defensive Midfielder(abv)'),
      name: t('Defensive Midfielder'),
    }),
    pos({
      abbreviation: 'm',
      abbreviationLabel: t('Attacking Midfielder(abv)'),
      name: t('Attacking Midfielder'),
    }),
    pos({
      abbreviation: 'a',
      abbreviationLabel: t('Striker(abv)'),
      name: t('Striker'),
    }),
  ],
} as const)

export const futsal = refineSync(StaticModality)({
  _tag: 'StaticModality',
  id: 'indoorSoccer',
  name: t('Futsal'),
  positions: [
    pos({
      abbreviation: 'g',
      abbreviationLabel: t('Goalkeeper(abv)'),
      name: t('Goalkeeper'),
    }),
    pos({
      abbreviation: 'f',
      abbreviationLabel: t('Defender(Futsal)(abv)'),
      name: t('Defender(Futsal)'),
    }),
    pos({
      abbreviation: 'ae',
      abbreviationLabel: t('Left Wing(abv)'),
      name: t('Left Wing'),
    }),
    pos({
      abbreviation: 'ad',
      abbreviationLabel: t('Right Wing(abv)'),
      name: t('Right Wing'),
    }),
    pos({
      abbreviation: 'p',
      abbreviationLabel: t('Pivot(abv)'),
      name: t('Pivot'),
    }),
  ],
} as const)

export const volleyball = refineSync(StaticModality)({
  _tag: 'StaticModality',
  id: 'volleyball',
  name: t('Volleyball'),
  positions: [
    pos({
      abbreviation: 'l',
      abbreviationLabel: t('Setter(abv)'),
      name: t('Setter'),
    }),
    pos({
      abbreviation: 'p',
      abbreviationLabel: t('Outside Hitter(abv)'),
      name: t('Outside Hitter'),
    }),
    pos({
      abbreviation: 'o',
      abbreviationLabel: t('Opposite Hitter(abv)'),
      name: t('Opposite Hitter'),
    }),
    pos({
      abbreviation: 'c',
      abbreviationLabel: t('Middle Blocker(abv)'),
      name: t('Middle Blocker'),
    }),
    pos({
      abbreviation: 'li',
      abbreviationLabel: t('Libero(abv)'),
      name: t('Libero'),
    }),
  ],
} as const)

export const basketball = refineSync(StaticModality)({
  _tag: 'StaticModality',
  id: 'basketball',
  name: t('Basketball'),
  positions: [
    pos({
      abbreviation: 'pg',
      abbreviationLabel: t('Point Guard(abv)'),
      name: t('Point Guard'),
    }),
    pos({
      abbreviation: 'sg',
      abbreviationLabel: t('Shooting Guard(abv)'),
      name: t('Shooting Guard'),
    }),
    pos({
      abbreviation: 'sf',
      abbreviationLabel: t('Small Forward(abv)'),
      name: t('Small Forward'),
    }),
    pos({
      abbreviation: 'pf',
      abbreviationLabel: t('Power Forward(abv)'),
      name: t('Power Forward'),
    }),
    pos({
      abbreviation: 'c',
      abbreviationLabel: t('Center(abv)'),
      name: t('Center'),
    }),
  ],
} as const)

export const staticModalities: NonEmptyReadonlyArray<StaticModality> = [
  soccer,
  futsal,
  volleyball,
  basketball,
]

export interface CustomModality extends S.Schema.Type<typeof CustomModality_> {}
const CustomModality_ = S.struct({
  _tag: S.literal('CustomModality'),
  id: Id,
  name: NonEmptyString,
  positions: S.nonEmptyArray(CustomPosition),
})
export const CustomModality: S.Schema<
  CustomModality,
  S.Schema.Encoded<typeof CustomModality_>
> = CustomModality_

export type Modality = StaticModality | CustomModality

export type Reference = S.Schema.Type<typeof Reference_>
const Reference_ = S.union(
  S.struct({ _tag: S.literal('StaticModality'), id: NonEmptyString }),
  S.struct({ _tag: S.literal('CustomModality'), id: Id }),
)
export const Reference: S.Schema<
  Reference,
  S.Schema.Encoded<typeof Reference_>
> = Reference_
