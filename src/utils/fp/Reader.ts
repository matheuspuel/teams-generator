export * from 'fp-ts/Reader'
import { Reader } from 'fp-ts/Reader'

export type EnvType<A extends Reader<never, unknown>> = Parameters<A>[0]

export type ValueType<A extends Reader<never, unknown>> = ReturnType<A>
