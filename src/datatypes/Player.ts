import { $, $f, A, D, Num, Ord, Show as Show_, Str } from 'fp'
import { Id } from 'src/utils/Entity'
import { avg } from 'src/utils/Number'
import { Position, Rating } from './'

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

export const PositionOrd: Ord<Player> = $(
  Position.Ord,
  Ord.contramap(p => p.position),
)

export const NameOrd: Ord<Player> = $(
  Str.Ord,
  Ord.contramap(p => p.name),
)

export const RatingOrd: Ord<Player> = $(
  Num.Ord,
  Ord.contramap(p => p.rating),
)

export const Show: Show_.Show<Player> = {
  show: p =>
    `${Rating.Show.show(p.rating)} - ${
      p.name
    } (${Position.AbbreviationShow.show(p.position)})`,
}

export const ListShow: Show_.Show<Array<Player>> = {
  show: $f(
    A.sortBy([PositionOrd, Ord.reverse(RatingOrd), NameOrd]),
    A.map(Show.show),
    A.intercalate(Str.Monoid)('\n'),
  ),
}

export const TeamListShow: Show_.Show<Array<Array<Player>>> = {
  show: $f(
    A.map(ListShow.show),
    A.mapWithIndex((i, t) => `Time ${i + 1}\n\n${t}`),
    A.intercalate(Str.Monoid)('\n\n'),
  ),
}

export const ShowSensitive: Show_.Show<Player> = {
  show: p => `${p.name} (${Position.AbbreviationShow.show(p.position)})`,
}

export const ListShowSensitive: Show_.Show<Array<Player>> = {
  show: $f(
    A.sortBy([PositionOrd, NameOrd]),
    A.map(ShowSensitive.show),
    A.intercalate(Str.Monoid)('\n'),
  ),
}

export const TeamListShowSensitive: Show_.Show<Array<Array<Player>>> = {
  show: $f(
    A.map(ListShowSensitive.show),
    A.mapWithIndex((i, t) => `Time ${i + 1}\n\n${t}`),
    A.intercalate(Str.Monoid)('\n\n'),
  ),
}

export const getRatingTotal: (players: Array<Player>) => number = A.foldMap(
  Num.MonoidSum,
)(p => p.rating)

export const getRatingAvg: (players: Array<Player>) => number = $f(
  A.map(p => p.rating),
  avg,
)
