import { A, flow, identity, pipe } from 'fp'

export const getCombinations: (
  n: number,
) => <A>(as: Array<A>) => Array<Array<A>> = n => as =>
  n === 0
    ? [[]]
    : A.length(as) < n
      ? []
      : pipe(
          as,
          A.map((a, i) =>
            pipe(A.drop(i + 1)(as), getCombinations(n - 1), A.map(A.append(a))),
          ),
          A.flatten,
        )

export const getCombinationsIndices =
  (k: number) =>
  (n: number): Array<Array<number>> =>
    k === 0
      ? [[]]
      : n < k
        ? []
        : pipe(
            A.makeBy(n, identity),
            A.map(i =>
              pipe(
                getCombinationsIndices(k - 1)(n - i - 1),
                A.map(
                  flow(
                    A.map(v => v + i + 1),
                    A.prepend(i),
                  ),
                ),
              ),
            ),
            A.flatten,
          )
