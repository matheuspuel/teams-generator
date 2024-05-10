import { Schema } from '@effect/schema'
import { Array, Order, Record, Tuple, absurd, identity, pipe } from 'effect'
import { NonEmptyReadonlyArray } from 'effect/Array'
import { Modality, Player } from 'src/datatypes'
import {
  ActiveOrd,
  CreatedAtOrder,
  NameOrd,
  PositionOrd,
  RatingOrd,
} from 'src/datatypes/Player'

export const GroupOrderTypeDict = {
  name: null,
  position: null,
  rating: null,
  active: null,
  date: null,
}

export type GroupOrderType = keyof typeof GroupOrderTypeDict

export const GroupOrderTypeSchema: Schema.Schema<GroupOrderType> =
  Schema.Literal(
    ...pipe(GroupOrderTypeDict, Record.toEntries, Array.map(Tuple.getFirst)),
  )

export type GroupOrder = NonEmptyReadonlyArray<
  Readonly<{
    _tag: GroupOrderType
    reverse: boolean
  }>
>

export const GroupOrder: Schema.Schema<GroupOrder> = Schema.NonEmptyArray(
  Schema.Struct({
    _tag: GroupOrderTypeSchema,
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
