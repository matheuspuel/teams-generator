import {
  Email,
  NonEmptyString,
  PhoneNumber,
  Slug,
} from '@common/src/datatypes/String'
import { infoEndpoint } from '@server/src/modules/realtor/routes/realtor/info'
import { pipe } from 'fp-ts/lib/function'
import { fromNullable } from 'fp-ts/lib/Option'
import { array, Decoder, map, nullable, struct } from 'io-ts/lib/Decoder'
import { defineEndpoint } from 'src/redux/utils'
import { EndpointBody, EndpointResponse } from 'src/utils/api'

export default defineEndpoint(builder =>
  builder.mutation({
    query: (_args: Body) => ({
      method: 'GET',
      url: '/realtor/realtor',
    }),
    transformResponse: parser.decode,
  }),
)

type Endpoint = typeof infoEndpoint
type Body = EndpointBody<Endpoint>
type Response = EndpointResponse<Endpoint>

const decoder: Decoder<unknown, Response> = struct({
  name: NonEmptyString.Decoder,
  websiteSlug: nullable(Slug.Decoder),
  contacts: struct({
    phones: array(PhoneNumber.Decoder),
    emails: array(Email.Decoder),
  }),
})

const parser = pipe(
  decoder,
  map(({ websiteSlug, ...v }) => ({
    ...v,
    websiteSlug: fromNullable(websiteSlug),
  })),
)
