import { pipe } from '@effect/data/Function'
import * as Match_ from '@effect/match'

export * from '@effect/match'

type Tags<D extends string, P> = P extends Record<D, infer X> ? X : never

export const valueSomeTags =
  <
    R,
    P extends {
      readonly [Tag in Tags<'_tag', R> & string]?:  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        | ((_: Extract<R, Record<'_tag', Tag>>) => any)
        | undefined
    },
  >(
    fields: P,
  ) =>
  (value: R) =>
    pipe(value, Match_.value, Match_.tags(fields))

export const valueTagsOrElse =
  <
    A extends { _tag: string },
    C extends {
      [k in A['_tag']]?: (a: Extract<A, { _tag: k }>) => unknown
    } & { _: (a: A) => unknown },
  >(
    cases: C,
  ) =>
  (a: A): ReturnType<NonNullable<C[keyof C]>> =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    (cases[a._tag as A['_tag']] ?? cases._)(a as any) as any
