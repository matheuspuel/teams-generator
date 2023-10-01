export * from 'effect/Either'
import { Either, Left, Right, left, right } from 'effect/Either'
import * as E_ from 'fp-ts/Either'

export type LeftType<A extends Either<unknown, unknown>> = A extends Left<
  infer E,
  unknown
>
  ? E
  : never

export type RightType<A extends Either<unknown, unknown>> = A extends Right<
  unknown,
  infer B
>
  ? B
  : never

export const fromFpTs: <E, A>(ma: E_.Either<E, A>) => Either<E, A> = E_.matchW(
  left,
  right,
)
