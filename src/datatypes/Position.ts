import {
  A,
  D,
  Num,
  Ord as Ord_,
  Order,
  Rec,
  Show,
  Tup,
  identity,
  pipe,
} from 'fp'

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
  ...pipe(Dict, Rec.toEntries, A.map(Tup.getFirst)),
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

export const Ord: Order<Position> = pipe(
  Num.Order,
  Ord_.mapInput(a => order[a]),
)

export const AbbreviationShow: Show.Show<Position> = { show: identity }
