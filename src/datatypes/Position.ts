import { $, D, identity, Num, Ord, Rec, Show } from 'fp'

export const PositionDict = {
  G: null,
  Z: null,
  LE: null,
  LD: null,
  M: null,
  A: null,
}

export type Position = keyof typeof PositionDict
export const Position: D.Schema<Position> = D.literal(...Rec.keys(PositionDict))

const PositionOrder: Record<Position, number> = {
  G: 1,
  Z: 2,
  LE: 3,
  LD: 4,
  M: 5,
  A: 6,
}

export const PositionOrd: Ord<Position> = $(
  Num.Ord,
  Ord.contramap(a => PositionOrder[a]),
)

export const PositionAbbreviationShow: Show.Show<Position> = { show: identity }
