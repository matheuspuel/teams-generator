import * as Context from 'effect/Context'
import { Effect } from 'effect/Effect'
import { Id } from 'src/utils/Entity'
import { F } from 'src/utils/fp'

export type IdGenerator = {
  generate: () => Effect<never, never, Id>
}

export const IdGeneratorEnv = Context.Tag<IdGenerator>()

export const IdGenerator = F.serviceFunctions(IdGeneratorEnv)
