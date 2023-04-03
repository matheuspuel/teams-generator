import { O, Option } from 'fp'

export const findFirstMapWithIndex =
  <A, B>(f: (index: number, a: A) => Option<B>) =>
  (as: Array<A>): Option<B> => {
    // eslint-disable-next-line functional/no-loop-statements
    for (let i = 0; i < as.length; i++) {
      const out = f(i, as[i] as A)
      if (O.isSome(out)) {
        return out
      }
    }
    return O.none
  }
