import { Array, flow, identity, pipe } from 'effect'

export const getCombinations: (
  n: number,
) => <A>(as: Array<A>) => Array<Array<A>> = n => as =>
  n === 0
    ? [[]]
    : Array.length(as) < n
      ? []
      : pipe(
          as,
          Array.map((a, i) =>
            pipe(
              Array.drop(i + 1)(as),
              getCombinations(n - 1),
              Array.map(Array.append(a)),
            ),
          ),
          Array.flatten,
        )

export const getCombinationsIndices =
  (k: number) =>
  (n: number): Array<Array<number>> =>
    k === 0
      ? [[]]
      : n < k
        ? []
        : pipe(
            Array.makeBy(n, identity),
            Array.map(i =>
              pipe(
                getCombinationsIndices(k - 1)(n - i - 1),
                Array.map(
                  flow(
                    Array.map(v => v + i + 1),
                    Array.prepend(i),
                  ),
                ),
              ),
            ),
            Array.flatten,
          )
