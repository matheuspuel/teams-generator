import * as Eq from '@effect/data/Equivalence'
import { ReadonlyRecord } from '@effect/data/ReadonlyRecord'

export * from '@effect/data/ReadonlyRecord'

export function isSubrecord<A>(E: Eq.Equivalence<A>): {
  (that: ReadonlyRecord<A>): (me: ReadonlyRecord<A>) => boolean
  (me: ReadonlyRecord<A>, that: ReadonlyRecord<A>): boolean
}
export function isSubrecord<A>(
  E: Eq.Equivalence<A>,
): (
  me: ReadonlyRecord<A>,
  that?: ReadonlyRecord<A>,
) => boolean | ((me: ReadonlyRecord<A>) => boolean) {
  return (me, that?) => {
    if (that === undefined) {
      const isSubrecordE = isSubrecord(E)
      return that => isSubrecordE(that, me)
    }
    // eslint-disable-next-line functional/no-loop-statements
    for (const k in me) {
      if (
        !Object.prototype.hasOwnProperty.call(that, k) ||
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        !E(me[k] as any, that[k] as any)
      ) {
        return false
      }
    }
    return true
  }
}
export function getEquivalence<K extends string, A>(
  E: Eq.Equivalence<A>,
): Eq.Equivalence<Readonly<Record<K, A>>>
export function getEquivalence<A>(
  E: Eq.Equivalence<A>,
): Eq.Equivalence<ReadonlyRecord<A>> {
  const isSubrecordE = isSubrecord(E)
  return Eq.make((x, y) => isSubrecordE(x)(y) && isSubrecordE(y)(x))
}
