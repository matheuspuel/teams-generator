import { Id } from 'src/utils/Entity'
import { A, flow, Num, Ord, pipe, Show, Str } from 'src/utils/fp-ts'
import { avg } from 'src/utils/Number'
import { Position, PositionAbrvShow, PositionOrd } from './Position'

export type Rating = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type Player = {
  id: Id
  name: string
  rating: Rating
  position: Position
}

export const PlayerPositionOrd: Ord<Player> = pipe(
  PositionOrd,
  Ord.contramap(p => p.position),
)

export const PlayerNameOrd: Ord<Player> = pipe(
  Str.Ord,
  Ord.contramap(p => p.name),
)

export const PlayerRatingOrd: Ord<Player> = pipe(
  Num.Ord,
  Ord.contramap(p => p.rating),
)

export const PlayerShow: Show.Show<Player> = {
  show: p => `${p.rating} - ${p.name} (${PositionAbrvShow.show(p.position)})`,
}

export const PlayerListShow: Show.Show<Player[]> = {
  show: flow(A.map(PlayerShow.show), A.intercalate(Str.Monoid)('\n')),
}

export const getRatingAvg: (players: Player[]) => number = flow(
  A.map(p => p.rating),
  avg,
)
