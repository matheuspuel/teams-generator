import { get, replace } from '@fp-ts/optic'
import { Tuple, absurd, pipe } from 'fp'
import { RootState } from 'src/model'
import { root } from 'src/model/optic'
import { State } from 'src/services/StateRef'

export type Route = 'Groups' | 'Group' | 'Player' | 'Result'

export const initialRoute: Route = 'Groups'

export const navigate = State.on(root.at('route')).set

export const goBack = (s: RootState) =>
  pipe(
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
    Tuple.mapSecond(route => replace(root.at('route'))(route)(s)),
  )
