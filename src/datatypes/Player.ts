import { sumAll } from 'effect/Number'
import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
import {
  A,
  Boolean,
  Number,
  O,
  Option,
  Ord,
  Order,
  S,
  String,
  flow,
  identity,
  pipe,
} from 'fp'
import { t } from 'src/i18n'
import { Id } from 'src/utils/Entity'
import { normalize } from 'src/utils/String'
import { Timestamp } from 'src/utils/datatypes'
import { Modality } from './Modality'
import * as Position from './Position'
import * as Rating from './Rating'

export interface Player extends S.Schema.To<typeof Schema_> {}
const Schema_ = S.struct({
  id: Id,
  name: S.string,
  rating: Rating.Schema,
  positionAbbreviation: Position.Abbreviation,
  active: S.boolean,
  createdAt: Timestamp.Schema,
})
export const Schema: S.Schema<S.Schema.From<typeof Schema_>, Player> = Schema_

export const Player = Schema

export const isActive = (p: Player) => p.active

const getPositionAndIndex =
  (args: { modality: Modality }) =>
  (player: Player): Option<{ position: Position.Position; index: number }> =>
    pipe(
      identity<
        NonEmptyReadonlyArray<Position.StaticPosition | Position.CustomPosition>
      >(args.modality.positions),
      A.findFirstMap((po, i) =>
        po.abbreviation === player.positionAbbreviation
          ? O.some({ position: po, index: i })
          : O.none(),
      ),
    )

export const PositionOrd = (args: { modality: Modality }): Order<Player> =>
  Ord.mapInput(Number.Order, p =>
    pipe(
      getPositionAndIndex(args)(p),
      O.match({ onNone: () => -1, onSome: _ => _.index }),
    ),
  )

export const NameOrd: Order<Player> = pipe(
  String.Order,
  Ord.mapInput(flow(p => p.name, normalize)),
)

export const RatingOrd: Order<Player> = pipe(
  Number.Order,
  Ord.mapInput(p => p.rating),
)

export const ActiveOrd: Order<Player> = pipe(
  Boolean.Order,
  Ord.mapInput(p => p.active),
)

export const CreatedAtOrder: Order<Player> = pipe(
  Timestamp.Order,
  Ord.mapInput(p => p.createdAt),
)

export const position =
  (args: { modality: Modality }) =>
  (player: Player): Option<Position.Position> =>
    O.map(getPositionAndIndex(args)(player), _ => _.position)

export const toString =
  (args: { modality: Modality }): ((player: Player) => string) =>
  p =>
    `${Rating.toString(p.rating)} - ${p.name} (${pipe(
      position(args)(p),
      O.map(Position.toAbbreviationString),
      O.getOrElse(() => '-'),
    )})`

export const listToString =
  (args: { modality: Modality }) =>
  (players: Array<Player>): string =>
    pipe(
      players,
      A.sortBy(PositionOrd(args), Ord.reverse(RatingOrd), NameOrd),
      A.map(toString(args)),
      A.join('\n'),
    )

export const teamListToString =
  (args: { modality: Modality }) =>
  (teams: Array<Array<Player>>): string =>
    pipe(
      teams,
      A.map(listToString(args)),
      A.map((v, i) => `${t('Team')} ${i + 1}\n\n${v}`),
      A.join('\n\n'),
    )

export const toStringSensitive =
  (args: { modality: Modality }) =>
  (player: Player): string =>
    `${player.name} (${pipe(
      position(args)(player),
      O.map(Position.toAbbreviationString),
      O.getOrElse(() => '-'),
    )})`

export const listToStringSensitive =
  (args: { modality: Modality }) =>
  (players: Array<Player>): string =>
    pipe(
      players,
      A.sortBy(PositionOrd(args), NameOrd),
      A.map(toStringSensitive(args)),
      A.join('\n'),
    )

export const teamListToStringSensitive =
  (args: { modality: Modality }) =>
  (teams: Array<Array<Player>>): string =>
    pipe(
      teams,
      A.map(listToStringSensitive(args)),
      A.map((v, i) => `${t('Team')} ${i + 1}\n\n${v}`),
      A.join('\n\n'),
    )

export const getRatingTotal: (players: Array<Player>) => number = players =>
  sumAll(A.map(players, p => p.rating))

export const getRatingAvg: (players: Array<Player>) => number = flow(
  A.map(p => p.rating),
  Number.avg,
)
