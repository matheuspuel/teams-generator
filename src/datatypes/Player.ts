import { sumAll } from 'effect/Number'
import { A, Boolean, Number, Ord, Order, S, String, flow, pipe } from 'fp'
import { Id } from 'src/utils/Entity'
import { normalize } from 'src/utils/String'
import { Timestamp } from 'src/utils/datatypes'
import * as Position from './Position'
import * as Rating from './Rating'

type Position = Position.Position
type Rating = Rating.Rating

export interface Player extends S.Schema.To<typeof Schema_> {}
const Schema_ = S.struct({
  id: Id,
  name: S.string,
  rating: Rating.Schema,
  position: Position.Schema,
  active: S.boolean,
  createdAt: Timestamp.Schema,
})
export const Schema: S.Schema<S.Schema.From<typeof Schema_>, Player> = Schema_

export const Player = Schema

export const isActive = (p: Player) => p.active

export const PositionOrd: Order<Player> = pipe(
  Position.Order,
  Ord.mapInput(p => p.position),
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

export const IdOrd: Order<Player> = pipe(
  String.Order,
  Ord.mapInput(p => p.id),
)

export const toString: (player: Player) => string = p =>
  `${Rating.toString(p.rating)} - ${p.name} (${Position.abbreviationToString(
    p.position,
  )})`

export const listToString: (players: Array<Player>) => string = flow(
  A.sortBy(PositionOrd, Ord.reverse(RatingOrd), NameOrd),
  A.map(toString),
  A.join('\n'),
)

export const teamListToString: (teams: Array<Array<Player>>) => string = flow(
  A.map(listToString),
  A.map((t, i) => `Time ${i + 1}\n\n${t}`),
  A.join('\n\n'),
)

export const toStringSensitive: (player: Player) => string = p =>
  `${p.name} (${Position.abbreviationToString(p.position)})`

export const listToStringSensitive: (players: Array<Player>) => string = flow(
  A.sortBy(PositionOrd, NameOrd),
  A.map(toStringSensitive),
  A.join('\n'),
)

export const teamListToStringSensitive: (
  teams: Array<Array<Player>>,
) => string = flow(
  A.map(listToStringSensitive),
  A.map((t, i) => `Time ${i + 1}\n\n${t}`),
  A.join('\n\n'),
)

export const getRatingTotal: (players: Array<Player>) => number = players =>
  sumAll(A.map(players, p => p.rating))

export const getRatingAvg: (players: Array<Player>) => number = flow(
  A.map(p => p.rating),
  Number.avg,
)
