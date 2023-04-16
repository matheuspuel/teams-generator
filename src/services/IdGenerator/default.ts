import cuid from 'cuid'
import { Id } from 'src/utils/Entity'
import { IdGenerator } from '.'

export const defaultIdGenerator: IdGenerator = {
  generate: () => Id(cuid()),
}
