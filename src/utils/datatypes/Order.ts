import { Equivalence, Order } from 'effect'

export const toEquivalence =
  <A>(order: Order.Order<A>): Equivalence.Equivalence<A> =>
  (a, b) =>
    order(a, b) === 0
