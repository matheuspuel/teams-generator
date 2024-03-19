import { Effect, Option, ReadonlyArray, pipe } from 'effect'
import * as Random from 'effect/Random'

export const randomizeArray = <A>(as: Array<A>): Effect.Effect<Array<A>> =>
  pipe(
    randomExtractElem(as),
    Effect.flatMap(
      Option.match({
        onNone: () => Effect.succeed(ReadonlyArray.empty<A>()),
        onSome: ([a, rest]) =>
          pipe(randomizeArray(rest), Effect.map(ReadonlyArray.append(a))),
      }),
    ),
  )

const randomExtractElem = <A>(
  as: Array<A>,
): Effect.Effect<Option.Option<[A, Array<A>]>> =>
  pipe(
    Random.nextIntBetween(0, as.length),
    Effect.map(i => extractElem(i)(as)),
  )

const extractElem =
  (index: number) =>
  <A>(as: Array<A>): Option.Option<[A, Array<A>]> =>
    Option.all([
      Option.fromNullable(as[index]),
      Option.some(ReadonlyArray.remove(index)(as)),
    ])
