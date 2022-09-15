import { contramap, Ord } from 'fp-ts/lib/Ord'
import { N } from 'src/utils/fp-ts'
import { getTimestamp } from './Entity'

export const timestampOrd: Ord<{ timestamp: number }> = contramap(getTimestamp)(
  N.Ord,
)
