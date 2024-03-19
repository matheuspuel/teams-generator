import { pipe } from 'effect/Function'
import { sumAll } from 'effect/Number'
import * as A from 'effect/ReadonlyArray'

export const avg = (ns: Array<number>) =>
  pipe(ns, sumAll, _ => _ / A.length(ns))

export const increment = (_: number) => _ + 1

export const decrement = (_: number) => _ - 1
