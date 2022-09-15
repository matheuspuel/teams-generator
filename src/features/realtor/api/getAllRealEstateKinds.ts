import { RealEstateFieldId } from '@server/src/modules/realtor/entities/RealEstateField'
import { RealEstateKindId } from '@server/src/modules/realtor/entities/RealEstateKind'
import { getAllEndpoint } from '@server/src/modules/realtor/routes/realEstateKind/getAll'
import { array, Decoder, number, string, struct } from 'io-ts/lib/Decoder'
import { defineEndpoint } from 'src/redux/utils'
import { EndpointBody, EndpointResponse } from 'src/utils/api'

export default defineEndpoint(builder =>
  builder.query({
    query: (_args: Body) => ({
      method: 'GET',
      url: '/realtor/real-estate-kind',
    }),
    transformResponse: decoder.decode,
  }),
)

type Endpoint = typeof getAllEndpoint
type Body = EndpointBody<Endpoint>
type Response = EndpointResponse<Endpoint>

const decoder: Decoder<unknown, Response> = array(
  struct({
    id: RealEstateKindId.Decoder,
    name: string,
    order: number,
    fieldIds: array(RealEstateFieldId.Decoder),
  }),
)
