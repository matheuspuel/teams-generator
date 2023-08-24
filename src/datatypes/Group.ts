import { $, $f, D, Ord, Order, Str } from 'fp'
import { Id } from 'src/utils/Entity'
import { normalize } from 'src/utils/String'
import { Player } from './Player'

export interface Group extends D.To<typeof Schema_> {}
const Schema_ = D.struct({
  id: Id,
  name: D.string,
  players: D.array(Player),
})
export const Schema: D.Schema<D.From<typeof Schema_>, Group> = Schema_

export const Group = Schema

export const NameOrd: Order<Group> = $(
  Str.Order,
  Ord.mapInput($f(p => p.name, normalize)),
)
