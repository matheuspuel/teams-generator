import {
  $,
  Clock,
  D,
  Duration,
  Effect,
  F,
  Num,
  Ord,
  Order as Order_,
  Predicate,
} from 'fp'

export const Schema = $(D.number, D.brand('Timestamp'))

export type Timestamp = D.To<typeof Schema>

export const Order: Order_<Timestamp> = Num.Order

export const getNow = (): Effect<never, never, Timestamp> =>
  F.map(Clock.currentTimeMillis, Schema)

export const add =
  (duration: Duration.DurationInput) => (timestamp: Timestamp) =>
    Num.add(Duration.toMillis(Duration.decode(duration)))(
      timestamp,
    ) as Timestamp

export const subtract =
  (duration: Duration.DurationInput) => (timestamp: Timestamp) =>
    Num.subtract(Duration.toMillis(Duration.decode(duration)))(
      timestamp,
    ) as Timestamp

export const differenceFrom =
  (from: Timestamp) =>
  (to: Timestamp): Duration.Duration =>
    Duration.millis(Num.subtract(from)(to))

export const differenceTo =
  (to: Timestamp) =>
  (from: Timestamp): Duration.Duration =>
    differenceFrom(from)(to)

export const isBefore: (comparedTo: Timestamp) => Predicate<Timestamp> =
  Ord.lt(Order)

export const isAfter: (comparedTo: Timestamp) => Predicate<Timestamp> =
  Ord.gt(Order)
