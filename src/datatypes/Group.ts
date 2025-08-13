import { Order, Schema, String, flow, pipe } from 'effect'
import { Id } from 'src/utils/Entity'
import { normalize } from 'src/utils/String'
import * as Modality from './Modality'
import { Player } from './Player'

export class Group extends Schema.Class<Group>('Group')({
  id: Id,
  name: Schema.String,
  players: Schema.Array(Player),
  modality: Modality.Reference,
}) {}

export const NameOrd: Order.Order<Group> = pipe(
  String.Order,
  Order.mapInput(flow(p => p.name, normalize)),
)
