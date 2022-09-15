import { Either, isLeft, left, right } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import { none, Option, some } from 'fp-ts/lib/Option'
import { isEmpty } from 'fp-ts/lib/string'
import { E, Rec } from 'src/utils/fp-ts'

export type Parse<T, F = unknown> = (a: F) => Either<NonEmptyArray<string>, T>

// export const parseProps =
//   <VS extends Record<string, Parse<any, unknown>>>(vs: VS) =>
//   (as: {
//     [k in keyof VS]: VS[k] extends Parse<infer A, unknown> ? A : never
//   }) =>
//     pipe(as, evolve(vs))

export const parseStruct = <
  VS extends Record<string, Either<unknown, unknown>>,
>(
  vs: VS,
): Either<
  {
    [k in keyof VS]: VS[k] extends Either<infer E, unknown> ? Option<E> : never
  },
  { [k in keyof VS]: VS[k] extends Either<unknown, infer A> ? A : never }
> =>
  Rec.some(isLeft)(vs)
    ? pipe(vs, Rec.map(E.matchW(some, () => none)), r =>
        left(
          r as {
            [k in keyof VS]: VS[k] extends Either<infer E, unknown>
              ? Option<E>
              : never
          },
        ),
      )
    : pipe(vs, Rec.map(E.getOrElseW(() => null)), r =>
        right(
          r as {
            [k in keyof VS]: VS[k] extends Either<unknown, infer A> ? A : never
          },
        ),
      )

export const NonEmptyStringFromString: Parse<NonEmptyString, string> =
  E.fromPredicate(
    (v): v is NonEmptyString => !isEmpty(v),
    () => [t('required_field')],
  )
