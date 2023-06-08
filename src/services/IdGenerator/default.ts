import cuid from 'cuid'
import { Id } from 'src/utils/Entity'
import { Eff } from 'src/utils/fp'
import { IdGenerator } from '.'

export const defaultIdGenerator: IdGenerator = {
  generate: Eff.sync(() => Id(cuid())),
}