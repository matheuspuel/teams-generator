import { logoffEndpoint } from '@server/src/modules/auth/routes/account/logoff'
import { defineEndpoint } from 'src/redux/utils'
import { EndpointBody } from 'src/utils/api'

export default defineEndpoint(builder =>
  builder.mutation({
    query: (_args: Body) => ({
      method: 'POST',
      url: '/auth/account/logoff',
    }),
  }),
)

type Endpoint = typeof logoffEndpoint
type Body = EndpointBody<Endpoint>
