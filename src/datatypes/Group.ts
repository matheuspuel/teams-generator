import { Id } from 'src/utils/Entity'
import { D } from 'src/utils/fp-ts'
import { Player } from './Player'

export type Group = {
  id: Id
  name: string
  players: Array<Player>
}

export const Group: D.Decoder<unknown, Group> = D.struct({
  id: Id,
  name: D.string,
  players: D.array(Player),
})
