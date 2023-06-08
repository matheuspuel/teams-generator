import * as Context from '@effect/data/Context'
import { Effect } from '@effect/io/Effect'
import { Id } from 'src/utils/Entity'
import { Eff } from 'src/utils/fp'

export type IdGenerator = {
  generate: Effect<never, never, Id>
}

export type IdGeneratorEnv = { idGenerator: IdGenerator }

export const IdGeneratorEnv = Context.Tag<IdGeneratorEnv>()

export const IdGenerator = {
  generate: Eff.flatMap(IdGeneratorEnv, env => env.idGenerator.generate),
}
