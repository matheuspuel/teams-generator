import * as Optic_ from '@fp-ts/optic'
import { Optional } from '@fp-ts/optic'
import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'

export * from '@fp-ts/optic'

export const nonEmptyIndex = <A>(
  n: number,
): Optional<NonEmptyReadonlyArray<A>, A> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
  (Optic_.id<NonEmptyReadonlyArray<A>>() as any).index(n)
