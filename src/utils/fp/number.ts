export * from 'fp-ts/number'
import * as A from 'fp-ts/Array'
import * as Monoid from 'fp-ts/Monoid'
import { Predicate } from 'fp-ts/Predicate'
import { pipe as $ } from 'fp-ts/function'
import { MonoidSum } from 'fp-ts/number'

export const isPositive: Predicate<number> = n => Math.sign(n) === 1

export const add = (b: number) => (a: number) => a + b

export const subtract = (subtrahend: number) => (minuend: number) =>
  minuend - subtrahend

export const div = (divisor: number) => (dividend: number) => dividend / divisor

export const avg = (ns: Array<number>) =>
  $(ns, Monoid.concatAll(MonoidSum), div(A.size(ns)))

export const increment = add(1)

export const decrement = add(-1)

export const quotientAndRemainder =
  (divisor: number) =>
  (dividend: number): [number, number] =>
    [Math.floor(dividend / divisor), dividend % divisor]
