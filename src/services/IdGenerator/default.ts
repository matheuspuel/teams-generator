import 'fast-text-encoding'

import { createId } from '@paralleldrive/cuid2'
import { Id } from 'src/utils/Entity'
import { F, Layer } from 'src/utils/fp'
import { IdGeneratorEnv } from '.'

export const IdGeneratorLive = IdGeneratorEnv.context({
  generate: () => F.sync(() => Id(createId())),
}).pipe(Layer.succeedContext)
