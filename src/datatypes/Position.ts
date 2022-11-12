import { D, identity, Num, Ord, pipe, Show } from 'src/utils/fp-ts'

export const PositionDict = {
  G: null,
  Z: null,
  LE: null,
  LD: null,
  M: null,
  A: null,
}

export type Position = keyof typeof PositionDict

export const PositionFromString: D.Decoder<string, Position> = D.fromRefinement(
  (v): v is Position => true,
  'Position',
)

export const Position: D.Decoder<unknown, Position> = pipe(
  D.string,
  D.compose(PositionFromString),
)

const PositionOrder: Record<Position, number> = {
  G: 1,
  Z: 2,
  LE: 3,
  LD: 4,
  M: 5,
  A: 6,
}

export const PositionOrd: Ord<Position> = pipe(
  Num.Ord,
  Ord.contramap(a => PositionOrder[a]),
)

export const PositionAbrvShow: Show.Show<Position> = { show: identity }
