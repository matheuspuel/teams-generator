import { LazyArg } from '@effect/data/Function'
import { Option, match } from '@effect/data/Option'

export * from '@effect/data/Option'

export const match_: {
  <B, A>(onNone: LazyArg<B>, onSome: (a: A) => B): (self: Option<A>) => B
  <A, B>(self: Option<A>, onNone: LazyArg<B>, onSome: (a: A) => B): B
} = match
