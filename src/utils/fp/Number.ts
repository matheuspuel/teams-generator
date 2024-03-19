import { pipe } from 'effect/Function'
import { sumAll } from 'effect/Number'

export const avg = (ns: Array<number>) => pipe(ns, sumAll, _ => _ / ns.length)

export const increment = (_: number) => _ + 1

export const decrement = (_: number) => _ - 1
