export * from '@effect/schema/Schema'
import { Schema, nonEmptyArray as nonEmptyArray_ } from '@effect/schema/Schema'
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray'

export const nonEmptyArray = nonEmptyArray_ as unknown as <I, A>(
  item: Schema<I, A>,
) => Schema<ReadonlyNonEmptyArray<I>, ReadonlyNonEmptyArray<A>>
