import { D } from 'fp'
import { Id } from 'src/utils/Entity'
import { Player } from './Player'

export type Group = {
  id: Id
  name: string
  players: ReadonlyArray<Player>
}

export const Schema = D.struct({
  id: Id,
  name: D.string,
  players: D.array(Player),
})

export const Group = Schema
