import { $, $f, A, D, Num, Ord, Show, Str } from 'fp'
import { Id } from 'src/utils/Entity'
import { avg } from 'src/utils/Number'
import { Position, PositionAbbreviationShow, PositionOrd } from './Position'

export const RatingList = [
  0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9,
  9.5, 10,
] as const

export type Rating = (typeof RatingList)[number]
export const Rating: D.Schema<Rating> = D.literal(...RatingList)

export const RatingShow: Show.Show<Rating> = {
  show: r => (r === 10 ? r.toString() : r.toFixed(1)).replace('.', ','),
}

export type Player = {
  id: Id
  name: string
  rating: Rating
  position: Position
  active: boolean
}
export const Player = D.struct({
  id: Id,
  name: D.string,
  rating: Rating,
  position: Position,
  active: D.boolean,
})

export const PlayerIsActive = (p: Player) => p.active

export const PlayerPositionOrd: Ord<Player> = $(
  PositionOrd,
  Ord.contramap(p => p.position),
)

export const PlayerNameOrd: Ord<Player> = $(
  Str.Ord,
  Ord.contramap(p => p.name),
)

export const PlayerRatingOrd: Ord<Player> = $(
  Num.Ord,
  Ord.contramap(p => p.rating),
)

export const PlayerShow: Show.Show<Player> = {
  show: p =>
    `${RatingShow.show(p.rating)} - ${p.name} (${PositionAbbreviationShow.show(
      p.position,
    )})`,
}

export const PlayerListShow: Show.Show<Array<Player>> = {
  show: $f(
    A.sortBy([PlayerPositionOrd, Ord.reverse(PlayerRatingOrd), PlayerNameOrd]),
    A.map(PlayerShow.show),
    A.intercalate(Str.Monoid)('\n'),
  ),
}

export const TeamListShow: Show.Show<Array<Array<Player>>> = {
  show: $f(
    A.map(PlayerListShow.show),
    A.mapWithIndex((i, t) => `Time ${i + 1}\n\n${t}`),
    A.intercalate(Str.Monoid)('\n\n'),
  ),
}

export const PlayerShowSensitive: Show.Show<Player> = {
  show: p => `${p.name} (${PositionAbbreviationShow.show(p.position)})`,
}

export const PlayerListShowSensitive: Show.Show<Array<Player>> = {
  show: $f(
    A.sortBy([PlayerPositionOrd, PlayerNameOrd]),
    A.map(PlayerShowSensitive.show),
    A.intercalate(Str.Monoid)('\n'),
  ),
}

export const TeamListShowSensitive: Show.Show<Array<Array<Player>>> = {
  show: $f(
    A.map(PlayerListShowSensitive.show),
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
