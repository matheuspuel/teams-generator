import { Id } from 'src/utils/Entity'
import { N, Ord, pipe, S } from 'src/utils/fp-ts'

export type Score = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

const PositionOrder = {
  goleiro: 1,
  zagueiro: 2,
  lateralEsquerdo: 3,
  lateralDireito: 4,
  meioCampo: 5,
  atacante: 6,
} as const

export type Position = keyof typeof PositionOrder

export const PositionOrd: Ord<Position> = pipe(
  N.Ord,
  Ord.contramap(a => PositionOrder[a]),
)

export type Player = {
  id: Id
  name: string
  score: Score
  position: Position
}

export const PlayerPositionOrd: Ord<Player> = pipe(
  PositionOrd,
  Ord.contramap(p => p.position),
)

export const PlayerNameOrd: Ord<Player> = pipe(
  S.Ord,
  Ord.contramap(p => p.name),
)
