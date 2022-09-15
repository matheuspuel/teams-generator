import { updateEndpoint } from '@server/src/modules/realtor/routes/realtor/update'
import { constUndefined } from 'fp-ts/lib/function'
import { isNone } from 'fp-ts/lib/Option'
import { defineEndpoint } from 'src/redux/utils'
import { EndpointBody } from 'src/utils/api'
import { O } from 'src/utils/fp-ts'

export default defineEndpoint(builder =>
  builder.mutation({
    query: (args: Body) => ({
      method: 'PATCH',
      url: '/realtor/realtor',
      body: {
        name: O.getOrElseW(constUndefined)(args.name),
        websiteSlug: isNone(args.websiteSlug)
          ? undefined
          : O.toNullable(args.websiteSlug.value),
      },
    }),
  }),
)

type Endpoint = typeof updateEndpoint
type Body = EndpointBody<Endpoint>
