import { Schema } from '@effect/schema'
import {
  Clock,
  Duration,
  Effect,
  Number,
  Order as Order_,
  Predicate,
  pipe,
} from 'effect'

export const Timestamp = pipe(Schema.Number, Schema.brand('Timestamp'))

export type Timestamp = Schema.Schema.Type<typeof Timestamp>

export const Order: Order_.Order<Timestamp> = Number.Order

export const add =
  (duration: Duration.DurationInput) => (timestamp: Timestamp) =>
    Number.sum(Duration.toMillis(Duration.decode(duration)))(
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
) => Predicate.Predicate<Timestamp> = Order_.lessThan(Order)

export const isAfter: (
  comparedTo: Timestamp,
) => Predicate.Predicate<Timestamp> = Order_.greaterThan(Order)

export const now = Clock.currentTimeMillis as Effect.Effect<Timestamp>
