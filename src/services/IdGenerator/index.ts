import { Effect } from 'effect'
import * as Context from 'effect/Context'
import { Id } from 'src/utils/Entity'

export type IdGenerator = {
  generate: () => Effect.Effect<Id>
}

export class IdGeneratorEnv extends Context.Tag('IdGenerator')<
  IdGeneratorEnv,
  IdGenerator
>() {}

export const IdGenerator = Effect.serviceFunctions(IdGeneratorEnv)
