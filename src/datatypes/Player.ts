import { $, $f, A, Bool, D, Num, Ord, Order, Show as Show_, Str } from 'fp'
import { Id } from 'src/utils/Entity'
import { normalize } from 'src/utils/String'
import * as Position from './Position'
import * as Rating from './Rating'

type Position = Position.Position
type Rating = Rating.Rating

export type Player = {
  id: Id
  name: string
  rating: Rating
  position: Position
  active: boolean
}

export const Schema = D.struct({
  id: Id,
  name: D.string,
  rating: Rating.Schema,
  position: Position.Schema,
  active: D.boolean,
})

export const Player = Schema

export const isActive = (p: Player) => p.active

export const PositionOrd: Order<Player> = $(
  Position.Ord,
  Ord.contramap(p => p.position),
)

export const NameOrd: Order<Player> = $(
  Str.Ord,
  Ord.contramap($f(p => p.name, normalize)),
)

export const RatingOrd: Order<Player> = $(
  Num.Order,
  Ord.contramap(p => p.rating),
)

export const ActiveOrd: Order<Player> = $(
  Bool.Ord,
  Ord.contramap(p => p.active),
)

export const IdOrd: Order<Player> = $(
  Str.Ord,
  Ord.contramap(p => p.id),
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

export const getRatingTotal: (players: Array<Player>) => number = A.combineMap(
  Num.MonoidSum,
)(p => p.rating)

export const getRatingAvg: (players: Array<Player>) => number = $f(
  A.map(p => p.rating),
  Num.avg,
)
