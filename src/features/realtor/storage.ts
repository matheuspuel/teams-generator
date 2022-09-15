import { array, string, struct } from 'io-ts/Decoder'
import { option } from 'src/utils/Decoder'
import { createStorage } from 'src/utils/storage'

export const RealtorDataStorage = createStorage({
  key: 'realtor/realtor',
  decoder: struct({
    name: string,
    websiteSlug: option(string),
    contacts: struct({ phones: array(string), emails: array(string) }),
  }),
})
