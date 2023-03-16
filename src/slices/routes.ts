import { get, replace } from '@fp-ts/optic'
import { $, $f, absurd, Tup } from 'fp'
import { RootState } from 'src/model'
import { execute, replaceSApp } from 'src/services/Store'
import { RootOptic } from '.'

export const RouteLens = RootOptic.at('route')

export type Route = 'Groups' | 'Group' | 'Player' | 'Result'

export const initialRoute: Route = 'Groups'

export const navigate = $f(replaceSApp(RouteLens), execute)

const goBackS = (s: RootState) =>
  $(
    get(RouteLens)(s),
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
    Tup.mapSnd(route => replace(RouteLens)(route)(s)),
  )

export const goBack = execute(goBackS)
