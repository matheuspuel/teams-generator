import * as Optic from '@fp-ts/optic'
import { RootState } from '.'

export const root = Optic.id<RootState>()
