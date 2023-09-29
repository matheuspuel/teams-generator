import { Optic, pipe } from 'fp'
import { RootState } from 'src/model'
import { root } from 'src/model/optic'
import { State } from 'src/services/StateRef'
import { A, Data, flow } from 'src/utils/fp'

export type Route = Data.TaggedEnum<{
  Groups: object
  Group: object
  Player: object
  Result: object
}>

export const Route = Data.taggedEnum<Route>()

const route$ = root.at('route')

export const navigate = (screen: Route) =>
  State.on(route$).update(
    flow(
      A.takeWhile(s => s._tag !== screen._tag),
      A.append(screen),
    ),
  )

export const navigateReplace = (screen: Route) =>
  State.on(route$).update(
    A.matchRight({
      onEmpty: () => [screen],
      onNonEmpty: init => [...init, screen],
    }),
  )

export const navigateSet = (screens: Array<Route>) =>
  State.on(route$).set(screens)

const isAllowedToGoBack = (_s: RootState): boolean => true

export const goBack = pipe(
  State.modify(s =>
    isAllowedToGoBack(s)
      ? A.match(A.dropRight(1)(s.route), {
          onEmpty: () => [{ shouldBubbleUpEvent: true }, s],
          onNonEmpty: ss => [
            { shouldBubbleUpEvent: false },
            Optic.replace(route$)(ss)(s),
          ],
        })
      : [{ shouldBubbleUpEvent: false }, s],
  ),
)
