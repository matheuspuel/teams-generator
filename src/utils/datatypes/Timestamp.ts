import {
  $,
  Clock,
  D,
  Effect,
  F,
  Num,
  Ord,
  Order as Order_,
  Predicate,
} from 'fp'
import { Duration } from './Duration'

export const Schema = $(D.number, D.brand('Timestamp'))

export type Timestamp = D.To<typeof Schema>

export const Order: Order_<Timestamp> = Num.Order

export const getNow = (): Effect<never, never, Timestamp> =>
  F.map(Clock.currentTimeMillis, Schema)

export const add = (duration: Duration) => (timestamp: Timestamp) =>
  Num.add(duration)(timestamp) as Timestamp

export const subtract = (duration: Duration) => (timestamp: Timestamp) =>
  Num.subtract(duration)(timestamp) as Timestamp

export const differenceFrom =
  (from: Timestamp) =>
  (to: Timestamp): Duration =>
    Num.subtract(from)(to)

export const differenceTo =
  (to: Timestamp) =>
  (from: Timestamp): Duration =>
    differenceFrom(from)(to)

export const isBefore: (comparedTo: Timestamp) => Predicate<Timestamp> =
  Ord.lt(Order)

export const isAfter: (comparedTo: Timestamp) => Predicate<Timestamp> =
  Ord.gt(Order)
