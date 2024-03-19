import { Match } from 'effect'
import { LazyArg, pipe } from 'effect/Function'

export * from 'effect/Match'

type Tags<D extends string, P> = P extends Record<D, infer X> ? X : never

export const valueSomeTags =
  <
    R,
    P extends {
      readonly [Tag in Tags<'_tag', R> & string]?:  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        | ((_: Extract<R, Record<'_tag', Tag>>) => any)
        | undefined
    } & { readonly [Tag in Exclude<keyof P, Tags<'_tag', R>>]: never },
  >(
    fields: P,
  ) =>
  (value: R) =>
    pipe(value, Match.value, Match.tags(fields))

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

export const valueString =
  <
    R extends string,
    P extends {
      readonly [Tag in R & string]: LazyArg<unknown>
    } & { readonly [Tag in Exclude<keyof P, R>]: never },
  >(
    fields: P,
  ) =>
  (value: R) =>
    pipe({ _tag: value }, Match.valueTags(fields))
