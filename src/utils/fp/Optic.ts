import * as Optic from '@fp-ts/optic'
import { Optional } from '@fp-ts/optic'
import { NonEmptyReadonlyArray } from 'effect/Array'

export const nonEmptyIndex = <A>(
  n: number,
): Optional<NonEmptyReadonlyArray<A>, A> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
  (Optic.id<NonEmptyReadonlyArray<A>>() as any).index(n)
