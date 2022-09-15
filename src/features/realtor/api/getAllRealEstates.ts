import { CEP, CityId } from '@common/src/datatypes/Address'
import { fromEnum } from '@common/src/utils/Enum'
import { AssetId } from '@server/src/modules/assets/entities/Asset'
import {
  RealEstateId,
  RealEstateStatus,
} from '@server/src/modules/realtor/entities/RealEstate'
import {
  RealEstateFieldId,
  RealEstateFieldOptionId,
} from '@server/src/modules/realtor/entities/RealEstateField'
import { getAllEndpoint } from '@server/src/modules/realtor/routes/realEstate/getAll'
import {
  array,
  Decoder,
  literal,
  nullable,
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
      url: '/realtor/real-estate',
    }),
    transformResponse: decoder.decode,
  }),
)

type Endpoint = typeof getAllEndpoint
type Body = EndpointBody<Endpoint>
type Response = EndpointResponse<Endpoint>

const decoder: Decoder<unknown, Response> = array(
  struct({
    id: RealEstateId.Decoder,
    status: nullable(fromEnum(RealEstateStatus)),
    address: struct({
      cep: nullable(CEP.Decoder),
      cityId: nullable(CityId.Decoder),
      complement: string,
      neighborhood: string,
      number: string,
      street: string,
    }),
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
  }),
)
