export type UnionToIntersection<U> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (U extends any ? (arg: U) => any : never) extends (arg: infer I) => void
    ? I
    : never

export type NotAnyOrElse<A, E> = 0 extends 1 & A ? E : A
