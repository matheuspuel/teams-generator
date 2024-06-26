import * as Optic from '@fp-ts/optic'
import { Array, Data, Effect, flow, pipe } from 'effect'
import { NonEmptyReadonlyArray } from 'effect/Array'
import { RootState } from 'src/model'
import { root } from 'src/model/optic'
import { State } from 'src/services/StateRef'
import * as Match from 'src/utils/fp/Match'

export type Route = Data.TaggedEnum<{
  Groups: object
  Modalities: object
  Group: object
  Player: object
  Result: object
  GroupForm: object
  ModalityForm: object
  DeleteGroup: object
  DeleteModality: object
  Parameters: object
  SortGroup: object
  HomeMenu: object
  GroupMenu: object
}>

export const Route = Data.taggedEnum<Route>()

const route$ = root.at('route')

const isAllowedToGoBack = (_s: RootState): boolean => true

const onNavigation = () =>
  pipe(
    State.flatWith(flow(Optic.get(route$), Array.last)),
    Effect.tap(
      flow(
        Match.valueSomeTags({}),
        Match.orElse(() => Effect.void),
      ),
    ),
    Effect.ignore,
  )

const update = flow(
  State.on(route$).update,
  Effect.tap(() => onNavigation()),
)

export const navigate = (screen: Route) =>
  update(
    flow(
      Array.takeWhile(s => s._tag !== screen._tag),
      Array.append(screen),
    ),
  )

export const navigateReplace = (screen: Route) =>
  update(
    Array.matchRight({
      onEmpty: () => [screen],
      onNonEmpty: init => Array.append(init, screen),
    }),
  )

export const navigateSet = (screens: NonEmptyReadonlyArray<Route>) =>
  update(() => screens)

export const goBack = pipe(
  State.with(isAllowedToGoBack),
  Effect.flatMap(isAllowedToGoBack =>
    isAllowedToGoBack
      ? State.with(flow(Optic.get(route$), Array.initNonEmpty)).pipe(
          Effect.flatMap(init =>
            Array.match(init, {
              onEmpty: () => Effect.succeed({ isHandled: false }),
              onNonEmpty: init =>
                Effect.succeed({ isHandled: true }).pipe(
                  Effect.tap(() => update(() => init)),
                ),
            }),
          ),
        )
      : Effect.succeed({ isHandled: true }),
  ),
)
