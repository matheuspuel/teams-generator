import { $, $f, A, identity } from 'fp'

export const getCombinations: (
  n: number,
) => <A>(as: Array<A>) => Array<Array<A>> = n => as =>
  n === 0
    ? [[]]
    : A.size(as) < n
    ? []
    : $(
        as,
        A.mapWithIndex((i, a) =>
          $(A.dropLeft(i + 1)(as), getCombinations(n - 1), A.map(A.append(a))),
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
      : $(
          A.makeBy(n, identity),
          A.map(i =>
            $(
              getCombinationsIndices(k - 1)(n - i - 1),
              A.map(
                $f(
                  A.map(v => v + i + 1),
                  A.prepend(i),
                ),
              ),
            ),
          ),
          A.flatten,
        )
