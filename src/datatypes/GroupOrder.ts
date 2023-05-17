import { $, D, Ord, Rec, absurd, identity } from 'fp'
import { Player } from 'src/datatypes'
import {
  ActiveOrd,
  IdOrd,
  NameOrd,
  PositionOrd,
  RatingOrd,
} from 'src/datatypes/Player'
import { RNEA } from 'src/utils/fp'

export const GroupOrderTypeDict = {
  name: null,
  position: null,
  rating: null,
  active: null,
  date: null,
}

export type GroupOrderType = keyof typeof GroupOrderTypeDict

export const GroupOrderTypeSchema: D.Schema<GroupOrderType> = D.literal(
  ...Rec.keys(GroupOrderTypeDict),
)

export type GroupOrder = RNEA.ReadonlyNonEmptyArray<
  Readonly<{
    _tag: GroupOrderType
    reverse: boolean
  }>
>

export const Schema: D.Schema<GroupOrder> = D.nonEmptyArray(
  D.struct({
    _tag: GroupOrderTypeSchema,
    reverse: D.boolean,
  }),
)

export const GroupOrder = Schema

export const initial: GroupOrder = [{ _tag: 'date', reverse: false }]

const typeToOrd = (type: GroupOrderType): Ord<Player> =>
  type === 'name'
    ? NameOrd
    : type === 'position'
    ? PositionOrd
    : type === 'rating'
    ? RatingOrd
    : type === 'active'
    ? ActiveOrd
    : type === 'date'
    ? IdOrd
    : absurd<never>(type)

export const toOrd = (order: GroupOrder): Ord<Player> =>
  $(
    order,
    RNEA.map(v => $(typeToOrd(v._tag), v.reverse ? Ord.reverse : identity)),
    RNEA.concatAll(Ord.getMonoid()),
  )
