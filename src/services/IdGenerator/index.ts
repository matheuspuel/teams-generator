import { createId } from '@paralleldrive/cuid2'
import { Effect, Layer } from 'effect'
import { Id } from 'src/utils/Entity'

export class IdGenerator extends Effect.Service<IdGenerator>()('IdGenerator', {
  accessors: true,
  succeed: {
    generate: () => Effect.sync(() => Id.make(createId())),
  },
}) {
  static Test = Layer.effect(
    IdGenerator,
    Effect.sync(() => {
      let currentId = 0
      return IdGenerator.make({
        generate: () => Effect.sync(() => Id.make((++currentId).toString())),
      })
    }),
  )
}
