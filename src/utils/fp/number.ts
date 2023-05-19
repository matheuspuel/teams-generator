export * from '@effect/data/Number'
import { MonoidSum } from '@effect/data/Number'
import * as A from '@effect/data/ReadonlyArray'
import { Predicate } from 'fp-ts/Predicate'
import { pipe as $ } from 'fp-ts/function'

export const isPositive: Predicate<number> = n => Math.sign(n) === 1

export const add = (b: number) => (a: number) => a + b

export const subtract = (subtrahend: number) => (minuend: number) =>
  minuend - subtrahend

export const div = (divisor: number) => (dividend: number) => dividend / divisor

export const avg = (ns: Array<number>) =>
  $(ns, MonoidSum.combineAll, div(A.length(ns)))

export const increment = add(1)

export const decrement = add(-1)

export const quotientAndRemainder =
  (divisor: number) =>
  (dividend: number): [number, number] =>
    [Math.floor(dividend / divisor), dividend % divisor]
