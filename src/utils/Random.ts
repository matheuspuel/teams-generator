import { Array, Effect, Option, Random, pipe } from 'effect'

export const randomizeArray = <A>(as: Array<A>): Effect.Effect<Array<A>> =>
  pipe(
    randomExtractElem(as),
    Effect.flatMap(v => {
      if (v === null) return Effect.succeed(Array.empty<A>())
      const [a, rest] = v
      return pipe(randomizeArray(rest), Effect.map(Array.append(a)))
    }),
  )

const randomExtractElem = <A>(
  as: Array<A>,
): Effect.Effect<readonly [A, Array<A>] | null> =>
  pipe(
    Random.nextIntBetween(0, as.length),
    Effect.map(i => extractElem(i)(as)),
  )

const extractElem =
  (index: number) =>
  <A>(as: Array<A>): readonly [A, Array<A>] | null =>
    pipe(
      Array.get(as, index),
      Option.map(_ => [_, Array.remove(index)(as)] as const),
      Option.getOrNull,
    )
