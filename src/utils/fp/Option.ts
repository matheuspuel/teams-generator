import { LazyArg } from '@effect/data/Function'
import * as O from '@effect/data/Option'
import { Option, match } from '@effect/data/Option'
import * as O_ from 'fp-ts/Option'

export * from '@effect/data/Option'

export const match_: {
  <B, A>(options: {
    onNone: LazyArg<B>
    onSome: (a: A) => B
  }): (self: Option<A>) => B
  <A, B>(
    self: Option<A>,
    options: { onNone: LazyArg<B>; onSome: (a: A) => B },
  ): B
} = match

export const fromFpTs: <A>(ma: O_.Option<A>) => Option<A> = O_.matchW(
  O.none,
  O.some,
)
