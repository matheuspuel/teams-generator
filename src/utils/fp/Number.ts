import { Option } from 'effect'
import { sumAll } from 'effect/Number'

export const average = (ns: Array<number>): Option.Option<number> =>
  ns.length === 0 ? Option.none() : Option.some(sumAll(ns) / ns.length)

export const increment = (_: number) => _ + 1

export const decrement = (_: number) => _ - 1
