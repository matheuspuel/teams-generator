import { sumAll } from 'effect/Number'

export const average = (ns: Array<number>): number | null =>
  ns.length === 0 ? null : sumAll(ns) / ns.length

export const increment = (_: number) => _ + 1

export const decrement = (_: number) => _ - 1
