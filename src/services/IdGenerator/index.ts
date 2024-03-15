import * as Context from 'effect/Context'
import { Effect } from 'effect/Effect'
import { Id } from 'src/utils/Entity'
import { F } from 'src/utils/fp'

export type IdGenerator = {
  generate: () => Effect<Id>
}

export class IdGeneratorEnv extends Context.Tag('IdGenerator')<
  IdGeneratorEnv,
  IdGenerator
>() {}

export const IdGenerator = F.serviceFunctions(IdGeneratorEnv)
