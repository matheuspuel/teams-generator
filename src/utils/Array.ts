import { O, Option } from './fp-ts'

export const findFirstMapWithIndex =
  <A, B>(f: (index: number, a: A) => Option<B>) =>
  (as: Array<A>): Option<B> => {
    // eslint-disable-next-line functional/no-loop-statement, functional/no-let
    for (let i = 0; i < as.length; i++) {
      const out = f(i, as[i] as A)
      // eslint-disable-next-line functional/no-conditional-statement
      if (O.isSome(out)) {
        return out
      }
    }
    return O.none
  }
