export * from 'fp-ts/Reader'
import { Reader } from 'fp-ts/Reader'

type UnionToIntersectionEnv<U> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (U extends [any] ? (arg: U) => any : never) extends (arg: [infer I]) => void
    ? I
    : never

export type EnvType<A extends Reader<never, unknown>> = UnionToIntersectionEnv<
  Parameters<A>
>

export type ValueType<A extends Reader<never, unknown>> = ReturnType<A>
