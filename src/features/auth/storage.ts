import { string } from 'io-ts/Decoder'
import { createStorage } from 'src/utils/storage'

export const AuthTokenStorage = createStorage<string>({
  key: 'auth/token',
  decoder: string,
})
