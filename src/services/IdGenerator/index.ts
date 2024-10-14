import { createId } from '@paralleldrive/cuid2'
import { Effect } from 'effect'
import { Id } from 'src/utils/Entity'

export class IdGenerator extends Effect.Service<IdGenerator>()('IdGenerator', {
  accessors: true,
  succeed: {
    generate: () => Effect.sync(() => Id.make(createId())),
  },
}) {}
