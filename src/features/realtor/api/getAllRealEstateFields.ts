import { fromEnum } from '@common/src/utils/Enum'
import {
  RealEstateFieldCategory,
  RealEstateFieldId,
  RealEstateFieldOptionId,
} from '@server/src/modules/realtor/entities/RealEstateField'
import { getAllEndpoint } from '@server/src/modules/realtor/routes/realEstateField/getAll'
import {
  array,
  Decoder,
  literal,
  number,
  string,
  struct,
  union,
} from 'io-ts/lib/Decoder'
import { defineEndpoint } from 'src/redux/utils'
import { EndpointBody, EndpointResponse } from 'src/utils/api'

export default defineEndpoint(builder =>
  builder.query({
    query: (_args: Body) => ({
      method: 'GET',
      url: '/realtor/real-estate-field',
    }),
    transformResponse: decoder.decode,
  }),
)

type Endpoint = typeof getAllEndpoint
type Body = EndpointBody<Endpoint>
type Response = EndpointResponse<Endpoint>

const decoderBaseProps = {
  id: RealEstateFieldId.Decoder,
  name: string,
  order: number,
  category: fromEnum(RealEstateFieldCategory),
}

const decoder: Decoder<unknown, Response> = array(
  union(
    struct({
      ...decoderBaseProps,
      type: literal('text'),
    }),
    struct({
      ...decoderBaseProps,
      type: literal('options'),
      options: array(
        struct({
          id: RealEstateFieldOptionId.Decoder,
          label: string,
          index: number,
        }),
      ),
    }),
  ),
)
