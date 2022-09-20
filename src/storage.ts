import { string, struct } from 'io-ts/Decoder'
import { PreviewData } from 'src/redux/slices/preview'
import { createStorage } from 'src/utils/storage'

export const PreviewDataStorage = createStorage<PreviewData>({
  key: 'core/preview',
  decoder: struct({ serverUrl: string }),
})
