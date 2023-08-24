import { sumAll } from '@effect/data/Number'
import { $, $f, A, Bool, D, Num, Ord, Order, Show as Show_, Str } from 'fp'
import { Id } from 'src/utils/Entity'
import { normalize } from 'src/utils/String'
import { Timestamp } from 'src/utils/datatypes'
import * as Position from './Position'
import * as Rating from './Rating'

type Position = Position.Position
type Rating = Rating.Rating

export interface Player extends D.To<typeof Schema_> {}
const Schema_ = D.struct({
  id: Id,
  name: D.string,
  rating: Rating.Schema,
  position: Position.Schema,
  active: D.boolean,
  createdAt: Timestamp.Schema,
})
export const Schema: D.Schema<D.From<typeof Schema_>, Player> = Schema_

export const Player = Schema

export const isActive = (p: Player) => p.active

export const PositionOrd: Order<Player> = $(
  Position.Ord,
  Ord.mapInput(p => p.position),
)

export const NameOrd: Order<Player> = $(
  Str.Order,
  Ord.mapInput($f(p => p.name, normalize)),
)

export const RatingOrd: Order<Player> = $(
  Num.Order,
  Ord.mapInput(p => p.rating),
)

export const ActiveOrd: Order<Player> = $(
  Bool.Order,
  Ord.mapInput(p => p.active),
)

export const CreatedAtOrder: Order<Player> = $(
  Timestamp.Order,
  Ord.mapInput(p => p.createdAt),
)

export const IdOrd: Order<Player> = $(
  Str.Order,
  Ord.mapInput(p => p.id),
)

export const Show: Show_.Show<Player> = {
  show: p =>
    `${Rating.Show.show(p.rating)} - ${
      p.name
    } (${Position.AbbreviationShow.show(p.position)})`,
}

export const ListShow: Show_.Show<Array<Player>> = {
  show: $f(
    A.sortBy(PositionOrd, Ord.reverse(RatingOrd), NameOrd),
    A.map(Show.show),
    A.join('\n'),
  ),
}

export const TeamListShow: Show_.Show<Array<Array<Player>>> = {
  show: $f(
    A.map(ListShow.show),
    A.map((t, i) => `Time ${i + 1}\n\n${t}`),
    A.join('\n\n'),
  ),
}

export const ShowSensitive: Show_.Show<Player> = {
  show: p => `${p.name} (${Position.AbbreviationShow.show(p.position)})`,
}

export const ListShowSensitive: Show_.Show<Array<Player>> = {
  show: $f(
    A.sortBy(PositionOrd, NameOrd),
    A.map(ShowSensitive.show),
    A.join('\n'),
  ),
}

export const TeamListShowSensitive: Show_.Show<Array<Array<Player>>> = {
  show: $f(
    A.map(ListShowSensitive.show),
    A.map((t, i) => `Time ${i + 1}\n\n${t}`),
    A.join('\n\n'),
  ),
}

export const getRatingTotal: (players: Array<Player>) => number = players =>
  sumAll(A.map(players, p => p.rating))

export const getRatingAvg: (players: Array<Player>) => number = $f(
  A.map(p => p.rating),
  Num.avg,
)
