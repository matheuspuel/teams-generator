export type AnyTagged = { _tag: string }

export type TagType<A extends AnyTagged, T extends AnyTagged['_tag']> = Extract<
  A,
  { _tag: T }
>

export const isTag =
  <K extends string>(tag: K) =>
  <A extends { _tag: string }>(
    v: K extends A['_tag'] ? A : never,
  ): v is Extract<typeof v, { _tag: K }> =>
    v._tag === tag

export const matchTag: {
  <
    A extends { _tag: string },
    C extends {
      [k in A['_tag']]: (a: Extract<A, { _tag: k }>) => unknown
    },
  >(
    cases: C,
  ): (a: A) => ReturnType<C[keyof C]>
  <
    A extends { _tag: string },
    C extends {
      [k in A['_tag']]?: (a: Extract<A, { _tag: k }>) => unknown
    } & { _: (a: A) => unknown },
  >(
    cases: C,
  ): (a: A) => ReturnType<NonNullable<C[keyof C]>>
  <
    A extends { _tag: string },
    C extends {
      [k in A['_tag']]?: (a: Extract<A, { _tag: k }>) => unknown
    },
  >(
    cases: C,
    orElse: <R extends Exclude<A, { _tag: keyof C }>>(a: R) => unknown,
  ): (a: A) => ReturnType<NonNullable<C[keyof C]>>
} =
  <
    A extends { _tag: string },
    C extends {
      [k in A['_tag']]?: (a: Extract<A, { _tag: k }>) => unknown
    } & { _: (a: A) => unknown },
    D,
  >(
    cases: C,
    orElse?: (a: Exclude<A, { _tag: keyof C }>) => D,
  ) =>
  (a: A): ReturnType<NonNullable<C[keyof C]>> =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    (cases[a._tag as A['_tag']] ?? cases._ ?? orElse)(a as any) as any
