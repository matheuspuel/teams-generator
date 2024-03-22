import { createId } from '@paralleldrive/cuid2'
import { Effect, Layer } from 'effect'
import { Id } from 'src/utils/Entity'
import { IdGenerator } from '.'

export const IdGeneratorLive = IdGenerator.context({
  generate: () => Effect.sync(() => Id(createId())),
}).pipe(Layer.succeedContext)
