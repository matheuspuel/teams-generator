import { get, replace } from '@fp-ts/optic'
import { $, Tup, absurd } from 'fp'
import { RootState } from 'src/model'
import { root } from 'src/model/optic'
import { StateRef } from 'src/services/StateRef'

export type Route = 'Groups' | 'Group' | 'Player' | 'Result'

export const initialRoute: Route = 'Groups'

export const navigate = StateRef.on(root.at('route')).set

export const goBack = (s: RootState) =>
  $(
    get(root.at('route'))(s),
    (r): [{ shouldBubbleUpEvent: boolean }, Route] =>
      r === 'Groups'
        ? [{ shouldBubbleUpEvent: true }, r]
        : [
            { shouldBubbleUpEvent: false },
            r === 'Group'
              ? 'Groups'
              : r === 'Player'
              ? 'Group'
              : r === 'Result'
              ? 'Group'
              : absurd<never>(r),
          ],
    Tup.mapSecond(route => replace(root.at('route'))(route)(s)),
  )
