import { Schema } from '@effect/schema'
import {
  Boolean,
  Number,
  Option,
  Order,
  ReadonlyArray,
  String,
  flow,
  identity,
  pipe,
} from 'effect'
import { sumAll } from 'effect/Number'
import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
import { t } from 'src/i18n'
import { Id } from 'src/utils/Entity'
import { normalize } from 'src/utils/String'
import { Timestamp } from 'src/utils/datatypes'
import { average } from 'src/utils/fp/Number'
import { Modality } from './Modality'
import * as Position from './Position'
import * as Rating from './Rating'

export interface Player extends Schema.Schema.Type<typeof Player_> {}
const Player_ = Schema.struct({
  id: Id,
  name: Schema.string,
  rating: Rating.Rating,
  positionAbbreviation: Position.Abbreviation,
  active: Schema.boolean,
  createdAt: Timestamp.Timestamp,
})
export const Player: Schema.Schema<
  Player,
  Schema.Schema.Encoded<typeof Player_>
> = Player_

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
      ReadonlyArray.findFirst((po, i) =>
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
      ReadonlyArray.sortBy(
        PositionOrd(args),
        Order.reverse(RatingOrd),
        NameOrd,
      ),
      ReadonlyArray.map(toString(args)),
      ReadonlyArray.join('\n'),
    )

export const teamListToString =
  (args: { modality: Modality }) =>
  (teams: Array<Array<Player>>): string =>
    pipe(
      teams,
      ReadonlyArray.map(listToString(args)),
      ReadonlyArray.map((v, i) => `${t('Team')} ${i + 1}\n\n${v}`),
      ReadonlyArray.join('\n\n'),
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
      ReadonlyArray.sortBy(PositionOrd(args), NameOrd),
      ReadonlyArray.map(toStringSensitive(args)),
      ReadonlyArray.join('\n'),
    )

export const teamListToStringSensitive =
  (args: { modality: Modality }) =>
  (teams: Array<Array<Player>>): string =>
    pipe(
      teams,
      ReadonlyArray.map(listToStringSensitive(args)),
      ReadonlyArray.map((v, i) => `${t('Team')} ${i + 1}\n\n${v}`),
      ReadonlyArray.join('\n\n'),
    )

export const getRatingTotal: (players: Array<Player>) => number = players =>
  sumAll(ReadonlyArray.map(players, p => p.rating))

export const getRatingAverage: (
  players: Array<Player>,
) => Option.Option<number> = flow(
  ReadonlyArray.map(p => p.rating),
  average,
)
