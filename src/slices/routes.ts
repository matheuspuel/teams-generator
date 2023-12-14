import { F, Match, NonEmptyReadonlyArray, Optic, pipe } from 'fp'
import { RootState } from 'src/model'
import { root } from 'src/model/optic'
import { State } from 'src/services/StateRef'
import { A, Data, flow } from 'src/utils/fp'

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
    State.flatWith(flow(Optic.get(route$), A.last)),
    F.tap(
      flow(
        Match.valueSomeTags({}),
        Match.orElse(() => F.unit),
      ),
    ),
    F.ignore,
  )

const update = flow(
  State.on(route$).update,
  F.tap(() => onNavigation()),
)

export const navigate = (screen: Route) =>
  update(
    flow(
      A.takeWhile(s => s._tag !== screen._tag),
      A.append(screen),
    ),
  )

export const navigateReplace = (screen: Route) =>
  update(
    A.matchRight({
      onEmpty: () => [screen],
      onNonEmpty: init => A.append(init, screen),
    }),
  )

export const navigateSet = (screens: NonEmptyReadonlyArray<Route>) =>
  update(() => screens)

export const goBack = pipe(
  State.with(isAllowedToGoBack),
  F.flatMap(isAllowedToGoBack =>
    isAllowedToGoBack
      ? State.with(flow(Optic.get(route$), A.initNonEmpty)).pipe(
          F.flatMap(init =>
            A.match(init, {
              onEmpty: () => F.succeed({ isHandled: false }),
              onNonEmpty: init =>
                F.succeed({ isHandled: true }).pipe(
                  F.tap(() => update(() => init)),
                ),
            }),
          ),
        )
      : F.succeed({ isHandled: true }),
  ),
)
