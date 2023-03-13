import { Id } from 'src/utils/Entity'
import { D } from 'src/utils/fp'
import { Player } from './Player'

export type Group = {
  id: Id
  name: string
  players: ReadonlyArray<Player>
}

export const Group = D.struct({
  id: Id,
  name: D.string,
  players: D.array(Player),
})
