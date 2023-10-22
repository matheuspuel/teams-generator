import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
import { A, Ord, Order, Record, S, Tuple, absurd, identity, pipe } from 'fp'
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

export const GroupOrderTypeSchema: S.Schema<GroupOrderType> = S.literal(
  ...pipe(GroupOrderTypeDict, Record.toEntries, A.map(Tuple.getFirst)),
)

export type GroupOrder = NonEmptyReadonlyArray<
  Readonly<{
    _tag: GroupOrderType
    reverse: boolean
  }>
>

export const Schema: S.Schema<GroupOrder> = S.nonEmptyArray(
  S.struct({
    _tag: GroupOrderTypeSchema,
    reverse: S.boolean,
  }),
)

export const GroupOrder = Schema

export const initial: GroupOrder = [{ _tag: 'date', reverse: false }]

const typeToOrder = (
  type: GroupOrderType,
): ((args: { modality: Modality }) => Order<Player>) =>
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
  (order: GroupOrder): ((args: { modality: Modality }) => Order<Player>) =>
  args =>
    pipe(
      order,
      A.map(v =>
        pipe(typeToOrder(v._tag)(args), v.reverse ? Ord.reverse : identity),
      ),
      Ord.combineAll,
    )
