import { get, replace } from '@fp-ts/optic'
import { $, absurd, Tup } from 'fp'
import { RootState } from 'src/model'
import { $op } from 'src/model/Optics'
import { execute, replaceSApp } from 'src/services/StateRef'

export type Route = 'Groups' | 'Group' | 'Player' | 'Result'

export const initialRoute: Route = 'Groups'

export const navigate = replaceSApp($op.route.$)

export const goBack = (s: RootState) =>
  $(
    get($op.route.$)(s),
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
    Tup.mapSnd(route => replace($op.route.$)(route)(s)),
  )

export const onGoBack = execute(goBack)
