import { createId } from '@paralleldrive/cuid2'
import { Effect, Layer } from 'effect'
import { Id } from 'src/utils/Entity'
import { IdGeneratorEnv } from '.'

export const IdGeneratorLive = IdGeneratorEnv.context({
  generate: () => Effect.sync(() => Id(createId())),
}).pipe(Layer.succeedContext)
