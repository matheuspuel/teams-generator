import * as Eq from 'effect/Equivalence'

function isSubrecord<A>(E: Eq.Equivalence<A>): {
  (that: A): (me: A) => boolean
  (me: A, that: A): boolean
}
function isSubrecord<A>(
  E: Eq.Equivalence<A>,
): (me: A, that?: A) => boolean | ((me: A) => boolean) {
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
        !E(me[k] as any, that?.[k] as any)
      ) {
        return false
      }
    }
    return true
  }
}

export const getEquivalence: {
  <K extends string, A>(
    E: Eq.Equivalence<A>,
  ): Eq.Equivalence<Readonly<Record<K, A>>>
  <A>(E: Eq.Equivalence<A>): Eq.Equivalence<A>
} = <A>(E: Eq.Equivalence<A>): Eq.Equivalence<A> => {
  const isSubrecordE = isSubrecord(E)
  return Eq.make((x, y) => isSubrecordE(x)(y) && isSubrecordE(y)(x))
}
