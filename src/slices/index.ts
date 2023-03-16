import { Optic } from 'fp'
import { RootState } from 'src/model'

export const RootOptic = Optic.id<RootState>()
