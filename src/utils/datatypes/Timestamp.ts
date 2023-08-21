import { $, D, Effect, F, Num, Ord as Ord_, Order, Predicate } from 'fp'
import { now } from 'fp-ts/Date'
import { Duration } from './Duration'

export const Schema = $(D.number, D.brand('Timestamp'))

export type Timestamp = D.To<typeof Schema>

export const Ord: Order<Timestamp> = Num.Order

export const getNow: Effect<never, never, Timestamp> = F.sync(
  () => now() as Timestamp,
)

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
  Ord_.lt(Ord)

export const isAfter: (comparedTo: Timestamp) => Predicate<Timestamp> =
  Ord_.gt(Ord)
