import { $, D, identity, Num, Ord as Ord_, Rec, Show } from 'fp'

export const Dict = {
  G: null,
  Z: null,
  LE: null,
  LD: null,
  M: null,
  A: null,
}

export type Position = keyof typeof Dict

export const Schema: D.Schema<Position> = D.literal(...Rec.keys(Dict))

export const Position = Schema

const order: Record<Position, number> = {
  G: 1,
  Z: 2,
  LE: 3,
  LD: 4,
  M: 5,
  A: 6,
}

export const Ord: Ord_<Position> = $(
  Num.Ord,
  Ord_.contramap(a => order[a]),
)

export const AbbreviationShow: Show.Show<Position> = { show: identity }
