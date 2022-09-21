import { Id } from 'src/utils/Entity'

export type Score = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type Position =
  | 'goleiro'
  | 'zagueiro'
  | 'lateral-esquerdo'
  | 'lateral-direito'
  | 'meio-campo'
  | 'atacante'

export type Player = {
  id: Id
  name: string
  score: Score
  position: Position
}
