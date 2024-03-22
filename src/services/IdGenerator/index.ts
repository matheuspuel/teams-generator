import { Effect } from 'effect'
import { Id } from 'src/utils/Entity'

export type IdGeneratorImplementation = {
  generate: () => Effect.Effect<Id>
}

export class IdGenerator extends Effect.Tag('IdGenerator')<
  IdGenerator,
  IdGeneratorImplementation
>() {}
