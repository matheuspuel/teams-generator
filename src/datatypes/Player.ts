import { sumAll } from 'effect/Number'
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
  pipe,
} from 'fp'
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

export const PositionOrd = (args: { modality: Modality }): Order<Player> =>
  Ord.mapInput(Number.Order, p =>
    pipe(
      args.modality.positions,
      A.findFirstIndex(po => po.abbreviation === p.positionAbbreviation),
      O.getOrElse(() => -1),
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
    pipe(
      args.modality.positions,
      A.findFirst(po => po.abbreviation === player.positionAbbreviation),
    )

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
      A.map((t, i) => `Time ${i + 1}\n\n${t}`),
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
      A.map((t, i) => `Time ${i + 1}\n\n${t}`),
      A.join('\n\n'),
    )

export const getRatingTotal: (players: Array<Player>) => number = players =>
  sumAll(A.map(players, p => p.rating))

export const getRatingAvg: (players: Array<Player>) => number = flow(
  A.map(p => p.rating),
  Number.avg,
)
