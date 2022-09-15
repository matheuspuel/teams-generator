import { startSmsAuthenticationEndpoint } from '@server/src/modules/auth/routes/account/startSmsAuthentication'
import { nullable } from 'io-ts/lib/Decoder'
import { defineEndpoint } from 'src/redux/utils'
import { EndpointBody } from 'src/utils/api'
import { undefinedDecoder } from 'src/utils/Decoder'

export default defineEndpoint(builder =>
  builder.mutation({
    query: (args: Body) => ({
      method: 'POST',
      url: '/auth/account/sms/start',
      body: args,
    }),
    transformResponse: nullable(undefinedDecoder).decode,
  }),
)

type Endpoint = typeof startSmsAuthenticationEndpoint
type Body = EndpointBody<Endpoint>
