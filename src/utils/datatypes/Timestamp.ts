import {
  Clock,
  Duration,
  Effect,
  F,
  Number,
  Ord,
  Order as Order_,
  Predicate,
  S,
  pipe,
} from 'fp'

export const Schema = pipe(S.number, S.brand('Timestamp'))

export type Timestamp = S.Schema.To<typeof Schema>

export const Order: Order_<Timestamp> = Number.Order

export const getNow = (): Effect<never, never, Timestamp> =>
  F.map(Clock.currentTimeMillis, Schema)

export const add =
  (duration: Duration.DurationInput) => (timestamp: Timestamp) =>
    Number.add(Duration.toMillis(Duration.decode(duration)))(
      timestamp,
    ) as Timestamp

export const subtract =
  (duration: Duration.DurationInput) => (timestamp: Timestamp) =>
    Number.subtract(Duration.toMillis(Duration.decode(duration)))(
      timestamp,
    ) as Timestamp

export const differenceFrom =
  (from: Timestamp) =>
  (to: Timestamp): Duration.Duration =>
    Duration.millis(Number.subtract(from)(to))

export const differenceTo =
  (to: Timestamp) =>
  (from: Timestamp): Duration.Duration =>
    differenceFrom(from)(to)

export const isBefore: (
  comparedTo: Timestamp,
) => Predicate.Predicate<Timestamp> = Ord.lt(Order)

export const isAfter: (
  comparedTo: Timestamp,
) => Predicate.Predicate<Timestamp> = Ord.gt(Order)
