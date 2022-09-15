import { constVoid, flow } from 'fp-ts/lib/function'
import { defineEndpoint } from 'src/redux/utils'
import { E, t } from 'src/utils/fp-ts'

export default defineEndpoint(builder =>
  builder.query({
    query: () => ({
      method: 'post',
      url: '/users/testeconexao',
    }),
    transformResponse: flow(
      t.strict({ valido: t.literal('T') }).decode,
      E.mapLeft(constVoid),
      E.map(constVoid),
    ),
  }),
)
