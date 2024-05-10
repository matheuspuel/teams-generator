import { Schema } from '@effect/schema'
import { Array, Order, absurd, identity, pipe } from 'effect'
import { Modality, Player } from 'src/datatypes'
import {
  ActiveOrd,
  CreatedAtOrder,
  NameOrd,
  PositionOrd,
  RatingOrd,
} from 'src/datatypes/Player'

export type GroupOrderType = Schema.Schema.Type<typeof GroupOrderType>
export const GroupOrderType = Schema.Literal(
  'name',
  'position',
  'rating',
  'active',
  'date',
)

export type GroupOrder = Schema.Schema.Type<typeof GroupOrder>
export const GroupOrder = Schema.NonEmptyArray(
  Schema.Struct({
    _tag: GroupOrderType,
    reverse: Schema.Boolean,
  }),
)

export const initial: GroupOrder = [{ _tag: 'date', reverse: false }]

const typeToOrder = (
  type: GroupOrderType,
): ((args: { modality: Modality }) => Order.Order<Player>) =>
  type === 'name'
    ? () => NameOrd
    : type === 'position'
      ? PositionOrd
      : type === 'rating'
        ? () => RatingOrd
        : type === 'active'
          ? () => ActiveOrd
          : type === 'date'
            ? () => CreatedAtOrder
            : absurd<never>(type)

export const toOrder =
  (
    order: GroupOrder,
  ): ((args: { modality: Modality }) => Order.Order<Player>) =>
  args =>
    pipe(
      order,
      Array.map(v =>
        pipe(typeToOrder(v._tag)(args), v.reverse ? Order.reverse : identity),
      ),
      Order.combineAll,
    )
