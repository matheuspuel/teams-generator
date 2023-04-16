import { IO } from 'fp'
import { Id } from 'src/utils/Entity'

export type IdGenerator = {
  generate: IO<Id>
}

export type IdGeneratorEnv = { idGenerator: IdGenerator }

export const IdGenerator = {
  generate: (env: IdGeneratorEnv) => env.idGenerator.generate,
}
