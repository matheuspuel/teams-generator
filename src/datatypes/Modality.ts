import { Schema } from 'effect'
import { NonEmptyReadonlyArray } from 'effect/Array'
import { t } from 'src/i18n'
import { Id } from 'src/utils/Entity'
import { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'
import { CustomPosition, StaticPosition } from './Position'

export class StaticModality extends Schema.Class<StaticModality>(
  'StaticModality',
)({
  _tag: Schema.Literal('StaticModality'),
  id: NonEmptyString,
  name: NonEmptyString,
  positions: Schema.NonEmptyArray(StaticPosition),
}) {}

const pos = Schema.decodeSync(StaticPosition)

export const soccerPositions = {
  g: pos({
    abbreviation: 'g',
    abbreviationLabel: t('Goalkeeper(abv)'),
    name: t('Goalkeeper'),
  }),
  z: pos({
    abbreviation: 'z',
    abbreviationLabel: t('Center Back(abv)'),
    name: t('Center Back'),
  }),
  le: pos({
    abbreviation: 'le',
    abbreviationLabel: t('Left Back(abv)'),
    name: t('Left Back'),
  }),
  ld: pos({
    abbreviation: 'ld',
    abbreviationLabel: t('Right Back(abv)'),
    name: t('Right Back'),
  }),
  v: pos({
    abbreviation: 'v',
    abbreviationLabel: t('Defensive Midfielder(abv)'),
    name: t('Defensive Midfielder'),
  }),
  m: pos({
    abbreviation: 'm',
    abbreviationLabel: t('Attacking Midfielder(abv)'),
    name: t('Attacking Midfielder'),
  }),
  a: pos({
    abbreviation: 'a',
    abbreviationLabel: t('Striker(abv)'),
    name: t('Striker'),
  }),
}

export const soccer = Schema.decodeSync(StaticModality)({
  _tag: 'StaticModality',
  id: 'soccer',
  name: t('Soccer'),
  positions: [
    soccerPositions.g,
    soccerPositions.z,
    soccerPositions.le,
    soccerPositions.ld,
    soccerPositions.v,
    soccerPositions.m,
    soccerPositions.a,
  ],
} as const)

export const futsalPositions = {
  g: pos({
    abbreviation: 'g',
    abbreviationLabel: t('Goalkeeper(abv)'),
    name: t('Goalkeeper'),
  }),
  f: pos({
    abbreviation: 'f',
    abbreviationLabel: t('Defender(Futsal)(abv)'),
    name: t('Defender(Futsal)'),
  }),
  ae: pos({
    abbreviation: 'ae',
    abbreviationLabel: t('Left Wing(abv)'),
    name: t('Left Wing'),
  }),
  ad: pos({
    abbreviation: 'ad',
    abbreviationLabel: t('Right Wing(abv)'),
    name: t('Right Wing'),
  }),
  p: pos({
    abbreviation: 'p',
    abbreviationLabel: t('Pivot(abv)'),
    name: t('Pivot'),
  }),
}

export const futsal = Schema.decodeSync(StaticModality)({
  _tag: 'StaticModality',
  id: 'indoorSoccer',
  name: t('Futsal'),
  positions: [
    futsalPositions.g,
    futsalPositions.f,
    futsalPositions.ae,
    futsalPositions.ad,
    futsalPositions.p,
  ],
} as const)

export const volleyballPositions = {
  l: pos({
    abbreviation: 'l',
    abbreviationLabel: t('Setter(abv)'),
    name: t('Setter'),
  }),
  p: pos({
    abbreviation: 'p',
    abbreviationLabel: t('Outside Hitter(abv)'),
    name: t('Outside Hitter'),
  }),
  o: pos({
    abbreviation: 'o',
    abbreviationLabel: t('Opposite Hitter(abv)'),
    name: t('Opposite Hitter'),
  }),
  c: pos({
    abbreviation: 'c',
    abbreviationLabel: t('Middle Blocker(abv)'),
    name: t('Middle Blocker'),
  }),
  li: pos({
    abbreviation: 'li',
    abbreviationLabel: t('Libero(abv)'),
    name: t('Libero'),
  }),
}

export const volleyball = Schema.decodeSync(StaticModality)({
  _tag: 'StaticModality',
  id: 'volleyball',
  name: t('Volleyball'),
  positions: [
    volleyballPositions.l,
    volleyballPositions.p,
    volleyballPositions.o,
    volleyballPositions.c,
    volleyballPositions.li,
  ],
} as const)

export const basketballPositions = {
  pg: pos({
    abbreviation: 'pg',
    abbreviationLabel: t('Point Guard(abv)'),
    name: t('Point Guard'),
  }),
  sg: pos({
    abbreviation: 'sg',
    abbreviationLabel: t('Shooting Guard(abv)'),
    name: t('Shooting Guard'),
  }),
  sf: pos({
    abbreviation: 'sf',
    abbreviationLabel: t('Small Forward(abv)'),
    name: t('Small Forward'),
  }),
  pf: pos({
    abbreviation: 'pf',
    abbreviationLabel: t('Power Forward(abv)'),
    name: t('Power Forward'),
  }),
  c: pos({
    abbreviation: 'c',
    abbreviationLabel: t('Center(abv)'),
    name: t('Center'),
  }),
}

export const basketball = Schema.decodeSync(StaticModality)({
  _tag: 'StaticModality',
  id: 'basketball',
  name: t('Basketball'),
  positions: [
    basketballPositions.pg,
    basketballPositions.sg,
    basketballPositions.sf,
    basketballPositions.pf,
    basketballPositions.c,
  ],
} as const)

export const staticModalities: NonEmptyReadonlyArray<StaticModality> = [
  soccer,
  futsal,
  volleyball,
  basketball,
]

export class CustomModality extends Schema.Class<CustomModality>(
  'CustomModality',
)({
  _tag: Schema.Literal('CustomModality'),
  id: Id,
  name: NonEmptyString,
  positions: Schema.NonEmptyArray(CustomPosition),
}) {}

export type Modality = StaticModality | CustomModality

export type Reference = Schema.Schema.Type<typeof Reference_>
const Reference_ = Schema.Union(
  Schema.Struct({ _tag: Schema.Literal('StaticModality'), id: NonEmptyString }),
  Schema.Struct({ _tag: Schema.Literal('CustomModality'), id: Id }),
)
export const Reference: Schema.Schema<
  Reference,
  Schema.Schema.Encoded<typeof Reference_>
> = Reference_
