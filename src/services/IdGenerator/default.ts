import cuid from 'cuid'
import { Id } from 'src/utils/Entity'
import { F } from 'src/utils/fp'
import { IdGenerator } from '.'

export const defaultIdGenerator: IdGenerator = {
  generate: F.sync(() => Id(cuid())),
}
