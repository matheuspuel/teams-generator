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
