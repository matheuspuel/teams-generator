import { Id } from 'src/utils/Entity'
import { Player } from './Player'

export type Group = {
  id: Id
  name: string
  players: Player[]
}
