import { AssetId } from '@server/src/modules/assets/entities/Asset'
import { RealEstateId } from '@server/src/modules/realtor/entities/RealEstate'
import {
  RealEstateFieldId,
  RealEstateFieldOptionId,
} from '@server/src/modules/realtor/entities/RealEstateField'
import { RealtorId } from '@server/src/modules/realtor/entities/Realtor'
import { createEndpoint } from '@server/src/modules/realtor/routes/realEstate/create'
import {
  array,
  Decoder,
  literal,
  string,
  struct,
  union,
} from 'io-ts/lib/Decoder'
import { defineEndpoint } from 'src/redux/utils'
import { EndpointBody, EndpointResponse } from 'src/utils/api'

export default defineEndpoint(builder =>
  builder.mutation({
    query: (args: Body) => ({
      method: 'POST',
      url: '/realtor/real-estate',
      body: args,
    }),
    transformResponse: decoder.decode,
  }),
)

type Endpoint = typeof createEndpoint
type Body = EndpointBody<Endpoint>
type Response = EndpointResponse<Endpoint>

const decoder: Decoder<unknown, Response> = struct({
  id: RealEstateId.Decoder,
  realtorId: RealtorId.Decoder,
  fields: array(
    union(
      struct({
        type: literal('options'),
        id: RealEstateFieldId.Decoder,
        optionId: RealEstateFieldOptionId.Decoder,
      }),
      struct({
        type: literal('text'),
        id: RealEstateFieldId.Decoder,
        value: string,
      }),
    ),
  ),
  images: array(struct({ assetId: AssetId.Decoder })),
})
