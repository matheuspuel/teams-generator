import { string, struct } from 'io-ts/Decoder'
import { createStorage } from 'src/utils/storage'
import { PreviewData } from './slices/preview'

export const PreviewDataStorage = createStorage<PreviewData>({
  key: 'core/preview',
  decoder: struct({ serverUrl: string }),
})
