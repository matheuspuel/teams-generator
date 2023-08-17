import * as E from '@effect/data/Either'
import * as O from '@effect/data/Option'
import { prism, Prism } from '@fp-ts/optic'
import { Option } from '.'

export * from '@fp-ts/optic'

export const some = <A>(): Prism<Option<A>, A> =>
  prism<O.Option<A>, A>(
    O.match({
      onNone: () => E.left(new Error('Expected a Some')),
      onSome: E.right,
    }),
    O.some,
  ) as unknown as Prism<Option<A>, A>
