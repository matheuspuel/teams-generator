import { A, Monoid, Num, pipe } from './fp-ts'

export const div = (divisor: number) => (dividend: number) => dividend / divisor

export const avg = (ns: number[]) =>
  pipe(ns, Monoid.concatAll(Num.MonoidSum), div(A.size(ns)))
