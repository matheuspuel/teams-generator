import { $, $f, D, Ord, Order, Str } from 'fp'
import { Id } from 'src/utils/Entity'
import { normalize } from 'src/utils/String'
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

export const NameOrd: Order<Group> = $(
  Str.Order,
  Ord.mapInput($f(p => p.name, normalize)),
)
