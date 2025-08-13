import {
  Array,
  Boolean,
  Number,
  Option,
  Order,
  Schema,
  String,
  flow,
  identity,
  pipe,
} from 'effect'
import { NonEmptyReadonlyArray } from 'effect/Array'
import { sumAll } from 'effect/Number'
import { t } from 'src/i18n'
import { Id } from 'src/utils/Entity'
import { normalize } from 'src/utils/String'
import { Timestamp } from 'src/utils/datatypes'
import { average } from 'src/utils/fp/Number'
import { Modality } from './Modality'
import * as Position from './Position'
import * as Rating from './Rating'

export class Player extends Schema.Class<Player>('Player')({
  id: Id,
  name: Schema.String,
  rating: Rating.Rating,
  positionAbbreviation: Position.Abbreviation,
  active: Schema.Boolean,
  createdAt: Timestamp.Timestamp,
}) {}

export const isActive = (p: Player) => p.active

const getPositionAndIndex =
  (args: { modality: Modality }) =>
  (
    player: Player,
  ): Option.Option<{ position: Position.Position; index: number }> =>
    pipe(
      identity<
        NonEmptyReadonlyArray<Position.StaticPosition | Position.CustomPosition>
      >(args.modality.positions),
      Array.findFirst((po, i) =>
        po.abbreviation === player.positionAbbreviation
          ? Option.some({ position: po, index: i })
          : Option.none(),
      ),
    )

export const PositionOrd = (args: {
  modality: Modality
}): Order.Order<Player> =>
  Order.mapInput(Number.Order, p =>
    pipe(
      getPositionAndIndex(args)(p),
      Option.match({ onNone: () => -1, onSome: _ => _.index }),
    ),
  )

export const NameOrd: Order.Order<Player> = pipe(
  String.Order,
  Order.mapInput(flow(p => p.name, normalize)),
)

export const RatingOrd: Order.Order<Player> = pipe(
  Number.Order,
  Order.mapInput(p => p.rating),
)

export const ActiveOrd: Order.Order<Player> = pipe(
  Boolean.Order,
  Order.mapInput(p => p.active),
)

export const CreatedAtOrder: Order.Order<Player> = pipe(
  Timestamp.Order,
  Order.mapInput(p => p.createdAt),
)

export const position =
  (args: { modality: Modality }) =>
  (player: Player): Option.Option<Position.Position> =>
    Option.map(getPositionAndIndex(args)(player), _ => _.position)

export const toString =
  (args: { modality: Modality }): ((player: Player) => string) =>
  p =>
    `${Rating.toString(p.rating)} - ${p.name} (${pipe(
      position(args)(p),
      Option.map(Position.toAbbreviationString),
      Option.getOrElse(() => '-'),
    )})`

export const listToString =
  (args: { modality: Modality }) =>
  (players: Array<Player>): string =>
    pipe(
      players,
      Array.sortBy(PositionOrd(args), Order.reverse(RatingOrd), NameOrd),
      Array.map(toString(args)),
      Array.join('\n'),
    )

export const teamListToString =
  (args: { modality: Modality }) =>
  (teams: Array<Array<Player>>): string =>
    pipe(
      teams,
      Array.map(listToString(args)),
      Array.map((v, i) => `${t('Team')} ${i + 1}\n\n${v}`),
      Array.join('\n\n'),
    )

export const toStringSensitive =
  (args: { modality: Modality }) =>
  (player: Player): string =>
    `${player.name} (${pipe(
      position(args)(player),
      Option.map(Position.toAbbreviationString),
      Option.getOrElse(() => '-'),
    )})`

export const listToStringSensitive =
  (args: { modality: Modality }) =>
  (players: Array<Player>): string =>
    pipe(
      players,
      Array.sortBy(PositionOrd(args), NameOrd),
      Array.map(toStringSensitive(args)),
      Array.join('\n'),
    )

export const teamListToStringSensitive =
  (args: { modality: Modality }) =>
  (teams: Array<Array<Player>>): string =>
    pipe(
      teams,
      Array.map(listToStringSensitive(args)),
      Array.map((v, i) => `${t('Team')} ${i + 1}\n\n${v}`),
      Array.join('\n\n'),
    )

export const getRatingTotal: (players: Array<Player>) => number = players =>
  sumAll(Array.map(players, p => p.rating))

export const getRatingAverage: (
  players: Array<Player>,
) => Option.Option<number> = flow(
  Array.map(p => p.rating),
  average,
)
