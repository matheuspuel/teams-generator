import { Schema } from '@effect/schema'
import { Order, String, flow, pipe } from 'effect'
import { Id } from 'src/utils/Entity'
import { normalize } from 'src/utils/String'
import * as Modality from './Modality'
import { Player } from './Player'

export interface Group extends Schema.Schema.Type<typeof Group_> {}
const Group_ = Schema.Struct({
  id: Id,
  name: Schema.String,
  players: Schema.Array(Player),
  modality: Modality.Reference,
})
export const Group: Schema.Schema<
  Group,
  Schema.Schema.Encoded<typeof Group_>
> = Group_

export const NameOrd: Order.Order<Group> = pipe(
  String.Order,
  Order.mapInput(flow(p => p.name, normalize)),
)
