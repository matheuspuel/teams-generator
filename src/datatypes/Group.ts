import { Ord, Order, S, String, flow, pipe } from 'fp'
import { Id } from 'src/utils/Entity'
import { normalize } from 'src/utils/String'
import * as Modality from './Modality'
import { Player } from './Player'

export interface Group extends S.Schema.Type<typeof Schema_> {}
const Schema_ = S.struct({
  id: Id,
  name: S.string,
  players: S.array(Player),
  modality: Modality.Reference,
})
export const Schema: S.Schema<Group, S.Schema.Encoded<typeof Schema_>> = Schema_

export const Group = Schema

export const NameOrd: Order<Group> = pipe(
  String.Order,
  Ord.mapInput(flow(p => p.name, normalize)),
)
