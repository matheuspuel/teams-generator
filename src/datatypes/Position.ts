import { A, Number, Ord, Record, S, Tuple, identity, pipe } from 'fp'

export const Dict = {
  G: null,
  Z: null,
  LE: null,
  LD: null,
  M: null,
  A: null,
}

export type Position = keyof typeof Dict

export const Schema: S.Schema<Position> = S.literal(
  ...pipe(Dict, Record.toEntries, A.map(Tuple.getFirst)),
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

export const Order: Ord.Order<Position> = pipe(
  Number.Order,
  Ord.mapInput(a => order[a]),
)

export const abbreviationToString: (position: Position) => string = identity
