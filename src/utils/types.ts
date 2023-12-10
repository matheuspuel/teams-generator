export type UnionToIntersection<U> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (U extends any ? (arg: U) => any : never) extends (arg: infer I) => void
    ? I
    : never

export type NotAnyOrElse<A, E> = 0 extends 1 & A ? E : A

export type DeepMutable<T> = T extends
  | // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((...args: Array<any>) => any)
  | number
  | string
  | boolean
  | null
  | undefined
  ? T
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends Record<keyof any, any>
    ? {
        -readonly [K in keyof T]: DeepMutable<T[K]>
      }
    : T
