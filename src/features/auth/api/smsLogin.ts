import { SmsCode } from '@common/src/datatypes/String'
import { SessionToken } from '@server/src/modules/auth/entities/Session'
import { smsLoginEndpoint } from '@server/src/modules/auth/routes/account/smsLogin'
import { Decoder, struct } from 'io-ts/lib/Decoder'
import { RegistrationData } from 'src/features/realtor/slices/registration'
import { RootState } from 'src/redux/store'
import { defineEndpoint } from 'src/redux/utils'
import { EndpointBody, EndpointResponse } from 'src/utils/api'

export default defineEndpoint(builder =>
  builder.mutation({
    queryFn: async (args: { smsCode: SmsCode }, api, extra, baseQuery) => {
      const data: Partial<RegistrationData> = (api.getState() as RootState)
        .realtor.registration
      if (!data.phoneNumber) throw new Error('Missing phone number')
      const body: Body = {
        phoneNumber: data.phoneNumber,
        smsCode: args.smsCode,
      }
      const res = await baseQuery({
        method: 'POST',
        url: '/auth/account/sms/login',
        body: body,
      })
      if (res.error) {
        return res
      } else {
        return { ...res, data: decoder.decode(res.data) }
      }
    },
  }),
)

type Endpoint = typeof smsLoginEndpoint
type Body = EndpointBody<Endpoint>
type Response = EndpointResponse<Endpoint>

const decoder: Decoder<unknown, Response> = struct({
  token: SessionToken.Decoder,
})
