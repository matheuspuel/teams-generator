import {
  Email,
  NonEmptyString,
  PhoneNumber,
  Slug,
} from '@common/src/datatypes/String'
import { createEndpoint } from '@server/src/modules/realtor/routes/realtor/create'
import { pipe } from 'fp-ts/lib/function'
import { fromNullable, none, toNullable } from 'fp-ts/lib/Option'
import { array, Decoder, map, nullable, struct } from 'io-ts/lib/Decoder'
import { defineEndpoint } from 'src/redux/utils'
import { EndpointBody, EndpointResponse } from 'src/utils/api'

export default defineEndpoint(builder =>
  builder.mutation({
    query: (args: { name: NonEmptyString; email: Email }) => {
      const body_: Body = {
        name: args.name,
        websiteSlug: none,
        contacts: { phones: [], emails: [args.email] },
      }
      const body = { ...body_, websiteSlug: toNullable(body_.websiteSlug) }
      return {
        method: 'POST',
        url: '/realtor/realtor',
        body,
      }
    },
    transformResponse: parser.decode,
  }),
)

type Endpoint = typeof createEndpoint
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
