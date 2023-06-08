import * as Context from '@effect/data/Context'
import { get } from '@fp-ts/optic'
import {
  $,
  $f,
  Apply,
  D,
  Eff,
  Effect,
  identity,
  none,
  not,
  O,
  Optic,
  Rec,
  S,
  some,
  Str,
} from 'fp'
import { Parameters as Parameters_, Player, Rating } from 'src/datatypes'
import { RootState } from 'src/model'
import { root } from 'src/model/Optics'
import { BackHandler } from 'src/services/BackHandler'
import { ShareService } from 'src/services/Share'
import { SplashScreen } from 'src/services/SplashScreen'
import {
  execute,
  getSApp,
  modifySApp,
  replaceSApp,
} from 'src/services/StateRef'
import { saveState } from 'src/slices/core/hydration'
import { onSelectGroupOrder } from 'src/slices/groupOrder'
import {
  createGroup,
  createPlayer,
  deleteCurrentPlayer,
  deleteGroup,
  editGroup,
  editPlayer,
  getGroupById,
  getPlayerFromActiveGroup,
  toggleAllPlayersActive,
  togglePlayerActive,
} from 'src/slices/groups'
import {
  decrementTeamsCount,
  incrementTeamsCount,
  togglePosition,
  toggleRating,
} from 'src/slices/parameters'
import { blankPlayerForm, getPlayerFormFromData } from 'src/slices/playerForm'
import { eraseResult, generateResult } from 'src/slices/result'
import { goBack, navigate } from 'src/slices/routes'
import {
  setDeleteGroupModal,
  setUpsertGroupModal,
  setUpsertGroupName,
} from 'src/slices/ui'
import { Duration } from 'src/utils/datatypes'
import { Id } from 'src/utils/Entity'

type EventTypeFromHandlers<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  H extends Record<string, (payload: never) => Effect<any, never, void>>,
> = {
  [k in keyof H]: Event<k & string, Parameters<H[k]>[0]>
}[keyof H]

type HandlerEnvFromHandlers<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  H extends Record<string, (payload: never) => Effect<any, never, void>>,
> = Effect.Context<ReturnType<H[keyof H]>>

export type AppEvent = EventTypeFromHandlers<typeof eventHandlers>

export type HandlerEnv = HandlerEnvFromHandlers<typeof eventHandlers>

const wait = (time: Duration): Effect<never, never, void> =>
  Eff.promise(() => new Promise(res => setTimeout(() => res(), time)))

const doNothing = Eff.unit()

const closeParametersModal = replaceSApp(root.ui.modalParameters.$)(false)

type EventHandlersRecord = Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (payload: never) => Effect<any, never, void>
>

export const eventHandlers = {
  doNothing: () => doNothing,
  preventSplashScreenAutoHide: () => SplashScreen.preventAutoHide,
  uiMount: () => SplashScreen.hide,
  appLoaded: () => execute(replaceSApp(root.core.loaded.$)(true)),
  saveState: () => saveState,
  goBack: () =>
    $(
      execute(goBack),
      Eff.tap(({ shouldBubbleUpEvent }) =>
        shouldBubbleUpEvent ? BackHandler.exit : Eff.unit(),
      ),
    ),

  openNewGroupModal: () =>
    execute(setUpsertGroupModal(some({ id: O.none(), name: '' }))),
  openEditGroupModal: (id: Id) =>
    $(
      S.gets(getGroupById(id)),
      S.flatMap(
        O.match(
          () => S.modify<RootState>(identity),
          g => setUpsertGroupModal(some({ id: O.some(id), name: g.name })),
        ),
      ),
      execute,
    ),
  closeGroupModal: () => execute(setUpsertGroupModal(none())),
  openDeleteGroupModal: (id: Id) => execute(setDeleteGroupModal(some({ id }))),
  closeDeleteGroupModal: () => execute(setDeleteGroupModal(none())),
  changeGroupName: $f(setUpsertGroupName, execute),
  saveGroup: () =>
    $(
      getSApp(root.ui.modalUpsertGroup.$),
      S.map(O.filter(m => $(m.name, not(Str.isEmpty)))),
      execute,
      Eff.flatMap(
        O.match(
          () => doNothing,
          m =>
            $(
              m.id,
              O.match(
                () => createGroup({ name: m.name }),
                id => execute(editGroup({ id, name: m.name })),
              ),
              Eff.tap(() => execute(setUpsertGroupModal(O.none()))),
            ),
        ),
      ),
    ),
  deleteGroup: () =>
    $(
      S.gets(Optic.get(root.ui.modalDeleteGroup.$)),
      S.flatMap(
        O.match(
          () => S.of<RootState, void>(undefined),
          ({ id }) => deleteGroup({ id }),
        ),
      ),
      S.apFirst(setDeleteGroupModal(none())),
      execute,
    ),
  selectGroup: (id: Id) =>
    $(
      navigate('Group'),
      S.flatMap(() => replaceSApp(root.ui.selectedGroupId.$)(O.some(id))),
      execute,
    ),

  openSortGroupModal: () =>
    execute(replaceSApp(root.ui.modalSortGroup.$)(O.some(null))),
  closeSortGroupModal: () =>
    execute(replaceSApp(root.ui.modalSortGroup.$)(O.none())),
  groupSortByName: () => $(onSelectGroupOrder('name'), execute),
  groupSortByPosition: () => $(onSelectGroupOrder('position'), execute),
  groupSortByRating: () => $(onSelectGroupOrder('rating'), execute),
  groupSortByActive: () => $(onSelectGroupOrder('active'), execute),
  groupSortByDate: () => $(onSelectGroupOrder('date'), execute),
  openParametersModal: () =>
    execute(replaceSApp(root.ui.modalParameters.$)(true)),
  closeParametersModal: () => execute(closeParametersModal),
  pressNewPlayer: () =>
    $(
      navigate('Player'),
      S.flatMap(() =>
        $(
          replaceSApp(root.ui.selectedPlayerId.$)(O.none()),
          S.apFirst(replaceSApp(root.playerForm.$)(blankPlayerForm)),
        ),
      ),
      execute,
    ),
  selectPlayer: (playerId: Id) =>
    $(
      navigate('Player'),
      S.flatMap(() =>
        $(
          getPlayerFromActiveGroup({ playerId }),
          S.flatMap(
            O.match(
              () => S.of<RootState, void>(undefined),
              $f(
                getPlayerFormFromData,
                replaceSApp(root.playerForm.$),
                S.apFirst(
                  replaceSApp(root.ui.selectedPlayerId.$)(O.some(playerId)),
                ),
              ),
            ),
          ),
        ),
      ),
      execute,
    ),
  togglePlayerActive: (id: Id) => execute(togglePlayerActive({ playerId: id })),
  toggleAllPlayersActive: () => execute(toggleAllPlayersActive),
  decrementTeamsCount: () => execute(decrementTeamsCount),
  incrementTeamsCount: () => execute(incrementTeamsCount),
  toggleTeamsCountType: () =>
    $(modifySApp(root.parameters.$)(Parameters_.toggleType), execute),
  togglePosition: () => execute(togglePosition),
  toggleRating: () => execute(toggleRating),
  shuffle: () =>
    $(
      S.of<RootState, void>(undefined),
      S.flatMap(() => eraseResult),
      S.flatMap(() => navigate('Result')),
      S.flatMap(() => closeParametersModal),
      execute,
      Eff.tap(() => wait(0)),
      Eff.flatMap(() => generateResult),
    ),

  changePlayerName: $f(replaceSApp(root.playerForm.name.$), execute),
  changePlayerPosition: $f(replaceSApp(root.playerForm.position.$), execute),
  changePlayerRating: $f(
    (v: number) => Math.round(v * 20) / 2,
    D.parseOption(Rating.Schema),
    v => v,
    O.map($f(replaceSApp(root.playerForm.rating.$), execute)),
    O.getOrElse(() => Eff.unit()),
  ),
  savePlayer: () =>
    $(
      Apply.sequenceS(S.Apply)({
        form: $(
          S.gets(get(root.playerForm.$)),
          S.map(f => $(f, O.liftPredicate(not(() => Str.isEmpty(f.name))))),
        ),
        groupId: S.gets(get(root.ui.selectedGroupId.$)),
        playerId: $(S.gets(get(root.ui.selectedPlayerId.$)), S.map(O.some)),
      }),
      S.map(O.struct),
      execute,
      Eff.flatMap(
        O.match(
          () => Eff.unit(),
          ({ form, groupId, playerId }) =>
            $(
              playerId,
              O.match(
                () => createPlayer({ groupId, player: form }),
                id => execute(editPlayer({ groupId, player: { ...form, id } })),
              ),
              Eff.flatMap(() => execute(goBack)),
            ),
        ),
      ),
      v => v,
    ),
  deletePlayer: () => $(deleteCurrentPlayer, S.apFirst(goBack), execute),

  shareTeamList: () =>
    $(
      execute(S.gets(get(root.result.$))),
      Eff.flatMap(
        O.match(
          () => Eff.unit(),
          $f(Player.TeamListShowSensitive.show, t =>
            ShareService.share({ message: t, title: 'Times' }),
          ),
        ),
      ),
    ),
} satisfies EventHandlersRecord

export type Event<T extends string, P> = {
  _tag: 'Event'
  event: { _tag: T; payload: P }
}

const makeEvent =
  <T extends string>(tag: T) =>
  // eslint-disable-next-line functional/functional-parameters
  <P extends [] | [unknown]>(...[p]: P): Event<T, P[0]> => ({
    _tag: 'Event',
    event: { _tag: tag, payload: p },
  })

const event = <T extends AppEvent['event']['_tag']>(tag: T) => {
  type P = Extract<AppEvent['event'], { _tag: T }>['payload']
  // eslint-disable-next-line functional/prefer-tacit
  return (payload: undefined extends P ? void : P): Event<T, P> =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    makeEvent(tag)(payload) as any
}

type VoidIfUndefined<A> = undefined extends A ? void : A

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const e: {
  [k in keyof typeof eventHandlers]: (
    payload: VoidIfUndefined<Parameters<(typeof eventHandlers)[k]>[0]>,
  ) => Event<k, Parameters<(typeof eventHandlers)[k]>[0]>
} = $(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  eventHandlers as any,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  Rec.map((_, t) => event(t as any)),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
) as any

export const on = {
  doNothing: e.doNothing(),
  preventSplashScreenAutoHide: e.preventSplashScreenAutoHide(),
  uiMount: e.uiMount(),
  appLoaded: e.appLoaded(),
  saveState: e.saveState(),
  goBack: e.goBack(),

  openNewGroupModal: e.openNewGroupModal(),
  openEditGroupModal: e.openEditGroupModal,
  closeGroupModal: e.closeGroupModal(),
  openDeleteGroupModal: e.openDeleteGroupModal,
  closeDeleteGroupModal: e.closeDeleteGroupModal(),
  changeGroupName: e.changeGroupName,
  saveGroup: e.saveGroup(),
  deleteGroup: e.deleteGroup(),
  selectGroup: e.selectGroup,

  openSortGroupModal: e.openSortGroupModal(),
  closeSortGroupModal: e.closeSortGroupModal(),
  groupSortByName: e.groupSortByName(),
  groupSortByPosition: e.groupSortByPosition(),
  groupSortByRating: e.groupSortByRating(),
  groupSortByActive: e.groupSortByActive(),
  groupSortByDate: e.groupSortByDate(),
  openParametersModal: e.openParametersModal(),
  closeParametersModal: e.closeParametersModal(),
  pressNewPlayer: e.pressNewPlayer(),
  selectPlayer: e.selectPlayer,
  togglePlayerActive: e.togglePlayerActive,
  toggleAllPlayersActive: e.toggleAllPlayersActive(),
  decrementTeamsCount: e.decrementTeamsCount(),
  incrementTeamsCount: e.incrementTeamsCount(),
  toggleTeamsCountType: e.toggleTeamsCountType(),
  togglePosition: e.togglePosition(),
  toggleRating: e.toggleRating(),
  shuffle: e.shuffle(),

  changePlayerName: e.changePlayerName,
  changePlayerPosition: e.changePlayerPosition,
  changePlayerRating: e.changePlayerRating,
  savePlayer: e.savePlayer(),
  deletePlayer: e.deletePlayer(),

  shareTeamList: e.shareTeamList(),
}

export type EventHandler<E extends Event<string, unknown>> = (
  event: E,
) => Effect<never, never, void>

export type EventHandlerEnv<E extends Event<string, unknown>> = {
  eventHandler: EventHandler<E>
}

export type AppEventHandlerEnv = EventHandlerEnv<AppEvent>

export const AppEventHandlerEnv = Context.Tag<AppEventHandlerEnv>()

export const EventHandler = {
  handle: (event: AppEvent): Effect<AppEventHandlerEnv, never, void> =>
    Eff.flatMap(AppEventHandlerEnv, env => env.eventHandler(event)),
}

const makeEventHandlerWithHandlers =
  <H extends EventHandlersRecord>(handlers: H) =>
  <E extends EventTypeFromHandlers<H>>(
    event: E,
  ): Effect.Unify<ReturnType<H[E['event']['_tag']]>> =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    (handlers[event.event._tag] as any)(event.event.payload)

export const appEventHandler = makeEventHandlerWithHandlers(eventHandlers)
