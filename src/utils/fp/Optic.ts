import * as E_ from '@effect/data/Either'
import { prism, Prism } from '@fp-ts/optic'
import * as O from 'effect/Option'
import { Option } from '.'
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Optic_ from '@fp-ts/optic'
import { Optional } from '@fp-ts/optic'
import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'

export * from '@fp-ts/optic'

export const nonEmptyIndex = <A>(
  n: number,
): Optional<NonEmptyReadonlyArray<A>, A> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
  (Optic_.id<NonEmptyReadonlyArray<A>>() as any).index(n)

const some = <A>(): Prism<Option<A>, A> =>
  prism<O.Option<A>, A>(
    O.match({
      onNone: () => E_.left(new Error('Expected a Some')),
      onSome: E_.right,
    }),
    O.some,
  )

type AnyTagged = { _tag: string }

const isTag =
  <A extends AnyTagged, K extends A['_tag']>(tag: K) =>
  (v: A): v is Extract<typeof v, { _tag: K }> =>
    v._tag === tag

const proto: unknown = Object.getPrototypeOf(Optic_.id())

// eslint-disable-next-line functional/no-expression-statements, functional/immutable-data, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(proto as any).tag = function (tag: string, message?: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
  return this.filter(isTag(tag), message)
}
// eslint-disable-next-line functional/no-expression-statements, functional/immutable-data, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(proto as any).some_ = function () {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
  return this.compose(some())
}

declare module '@fp-ts/optic' {
  export interface Optic<
    in GetWhole,
    in SetWholeBefore,
    in SetPiece,
    out GetError,
    out SetError,
    out GetPiece,
    out SetWholeAfter,
  > {
    tag: {
      <S, A extends B, Tag extends B['_tag'], B extends { _tag: string } = A>(
        this: Prism<S, A>,
        tag: Tag,
        message?: string,
      ): Prism<S, Extract<B, { _tag: Tag }>>
      <S, A extends B, Tag extends B['_tag'], B extends { _tag: string } = A>(
        this: Optional<S, A>,
        tag: Tag,
        message?: string,
      ): Optional<S, Extract<B, { _tag: Tag }>>
    }

    some_: {
      <S, A>(this: Prism<S, O.Option<A>>): Prism<S, A>
      <S, A>(this: Optional<S, O.Option<A>>): Optional<S, A>
    }
  }
}
