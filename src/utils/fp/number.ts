import { pipe } from '@effect/data/Function'
import { sumAll } from '@effect/data/Number'
import { Predicate } from '@effect/data/Predicate'
import * as A from '@effect/data/ReadonlyArray'

export * from '@effect/data/Number'

export const isPositive: Predicate<number> = n => Math.sign(n) === 1

export const add = (b: number) => (a: number) => a + b

export const subtract = (subtrahend: number) => (minuend: number) =>
  minuend - subtrahend

export const div = (divisor: number) => (dividend: number) => dividend / divisor

export const avg = (ns: Array<number>) => pipe(ns, sumAll, div(A.length(ns)))

export const increment = add(1)

export const decrement = add(-1)

export const quotientAndRemainder =
  (divisor: number) =>
  (dividend: number): [number, number] => [
    Math.floor(dividend / divisor),
    dividend % divisor,
  ]
