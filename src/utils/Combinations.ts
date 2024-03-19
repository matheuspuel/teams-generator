import { ReadonlyArray, flow, identity, pipe } from 'effect'

export const getCombinations: (
  n: number,
) => <A>(as: Array<A>) => Array<Array<A>> = n => as =>
  n === 0
    ? [[]]
    : ReadonlyArray.length(as) < n
      ? []
      : pipe(
          as,
          ReadonlyArray.map((a, i) =>
            pipe(
              ReadonlyArray.drop(i + 1)(as),
              getCombinations(n - 1),
              ReadonlyArray.map(ReadonlyArray.append(a)),
            ),
          ),
          ReadonlyArray.flatten,
        )

export const getCombinationsIndices =
  (k: number) =>
  (n: number): Array<Array<number>> =>
    k === 0
      ? [[]]
      : n < k
        ? []
        : pipe(
            ReadonlyArray.makeBy(n, identity),
            ReadonlyArray.map(i =>
              pipe(
                getCombinationsIndices(k - 1)(n - i - 1),
                ReadonlyArray.map(
                  flow(
                    ReadonlyArray.map(v => v + i + 1),
                    ReadonlyArray.prepend(i),
                  ),
                ),
              ),
            ),
            ReadonlyArray.flatten,
          )
