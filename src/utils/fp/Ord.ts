export * from 'fp-ts/Ord'
import { geq as geq_, gt as gt_, leq as leq_, lt as lt_, Ord } from 'fp-ts/Ord'

export const lt: <A>(O: Ord<A>) => (second: A) => (first: A) => boolean =
  O => b => a =>
    lt_(O)(a, b)

export const gt: <A>(O: Ord<A>) => (second: A) => (first: A) => boolean =
  O => b => a =>
    gt_(O)(a, b)

export const leq: <A>(O: Ord<A>) => (second: A) => (first: A) => boolean =
  O => b => a =>
    leq_(O)(a, b)

export const geq: <A>(O: Ord<A>) => (second: A) => (first: A) => boolean =
  O => b => a =>
    geq_(O)(a, b)
