import { get, replace } from '@fp-ts/optic'
import { $, Tup, absurd } from 'fp'
import { RootState } from 'src/model'
import { root } from 'src/model/Optics'
import { execute, replaceSApp } from 'src/services/StateRef'

export type Route = 'Groups' | 'Group' | 'Player' | 'Result'

export const initialRoute: Route = 'Groups'

export const navigate = replaceSApp(root.route.$)

export const goBack = (s: RootState) =>
  $(
    get(root.route.$)(s),
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
    Tup.mapSnd(route => replace(root.route.$)(route)(s)),
  )

export const onGoBack = execute(goBack)
