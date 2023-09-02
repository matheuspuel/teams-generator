import { Optic } from 'src/utils/fp'
import { RootState } from '.'

export const root = Optic.id<RootState>()
