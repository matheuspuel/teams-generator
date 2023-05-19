import { $, A, D, identity, Num, Ord as Ord_, Order, Rec, Show, Tup } from 'fp'

export const Dict = {
  G: null,
  Z: null,
  LE: null,
  LD: null,
  M: null,
  A: null,
}

export type Position = keyof typeof Dict

export const Schema: D.Schema<Position> = D.literal(
  ...$(Dict, Rec.toEntries, A.map(Tup.fst)),
)

export const Position = Schema

const order: Record<Position, number> = {
  G: 1,
  Z: 2,
  LE: 3,
  LD: 4,
  M: 5,
  A: 6,
}

export const Ord: Order<Position> = $(
  Num.Order,
  Ord_.contramap(a => order[a]),
)

export const AbbreviationShow: Show.Show<Position> = { show: identity }
