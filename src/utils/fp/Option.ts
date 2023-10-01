import { LazyArg } from 'effect/Function'
import * as O from 'effect/Option'
import { Option, match } from 'effect/Option'
import * as O_ from 'fp-ts/Option'

export * from 'effect/Option'

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
