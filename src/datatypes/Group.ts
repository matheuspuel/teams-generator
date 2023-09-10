import { D, Ord, Order, Str, flow, pipe } from 'fp'
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

export const NameOrd: Order<Group> = pipe(
  Str.Order,
  Ord.mapInput(flow(p => p.name, normalize)),
)
