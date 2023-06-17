import * as Context from '@effect/data/Context'
import * as A from '@effect/data/ReadonlyArray'
import { Effect } from '@effect/io/Effect'
import { UnionToIntersection } from '../types'

export * from '@effect/data/Context'

export const mergedContext =
  <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Tags extends Array<Context.Tag<any, any>>,
  >(
    // eslint-disable-next-line functional/functional-parameters
    ...tags: Tags
  ) =>
  (
    implementations: UnionToIntersection<Effect.Context<Tags[number]>>,
  ): Context.Context<Effect.Context<Tags[number]>> =>
    A.reduce(
      tags,
      Context.empty() as Context.Context<Effect.Context<Tags[number]>>,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
      (c, t) => Context.add(c, t, implementations) as any,
    )
