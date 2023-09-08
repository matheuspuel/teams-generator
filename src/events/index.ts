import { get } from '@fp-ts/optic'
import {
  $,
  $f,
  Apply,
  D,
  F,
  O,
  Optic,
  S,
  Str,
  constant,
  identity,
  none,
  not,
  pipe,
  some,
} from 'fp'
import { Parameters as Parameters_, Player, Rating } from 'src/datatypes'
import { exportGroup, importGroupFromDocumentPicker } from 'src/export/group'
import { RootState } from 'src/model'
import { root } from 'src/model/optic'
import { Alert } from 'src/services/Alert'
import { BackHandler } from 'src/services/BackHandler'
import { ShareService } from 'src/services/Share'
import { SplashScreen } from 'src/services/SplashScreen'
import {
  StateRef,
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
import { Id } from 'src/utils/Entity'
import {
  AnyHandleEventTree,
  EventFromTree,
  EventHandlerEnvFromTree,
  makeEventConstructors,
} from './helpers'

export type AppEvent = EventFromTree<typeof appEventsDefinition>

export type AppEventHandlerRequirements = EventHandlerEnvFromTree<
  typeof appEventsDefinition
>

const defineEvents: <T extends AnyHandleEventTree>(tree: T) => T = identity

const noArg: <A>(a: A) => (_: void) => A = constant
const ignore = noArg(F.unit)

const closeParametersModal = replaceSApp(root.at('ui').at('modalParameters'))(
  false,
)

export const appEventsDefinition = defineEvents({
  doNothing: ignore,
  back: (_: void) =>
    $(
      StateRef.modify(goBack),
      F.tap(({ shouldBubbleUpEvent }) =>
        shouldBubbleUpEvent ? BackHandler.exit() : F.unit,
      ),
    ),
  core: {
    preventSplashScreenAutoHide: (_: void) => SplashScreen.preventAutoHide(),
    uiMount: (_: void) => SplashScreen.hide(),
    appLoaded: (_: void) =>
      StateRef.modify(replaceSApp(root.at('core').at('isLoaded'))(true)),
    saveState: (_: void) => saveState,
  },
  alert: { dismiss: (_: void) => Alert.dismiss() },
  groups: {
    menu: {
      open: (_: void) =>
        StateRef.modify(replaceSApp(root.at('ui').at('homeMenu'))(true)),
      close: (_: void) =>
        StateRef.modify(replaceSApp(root.at('ui').at('homeMenu'))(false)),
    },
    import: (_: void) =>
      pipe(
        replaceSApp(root.at('ui').at('homeMenu'))(false),
        StateRef.modify,
        F.tap(() => importGroupFromDocumentPicker()),
        F.ignore,
      ),
    item: {
      open: (id: Id) =>
        $(
          navigate('Group'),
          S.flatMap(() =>
            replaceSApp(root.at('ui').at('selectedGroupId'))(O.some(id)),
          ),
          StateRef.modify,
        ),
      upsert: {
        new: (_: void) =>
          StateRef.modify(
            setUpsertGroupModal(some({ id: O.none(), name: '' })),
          ),
        edit: (id: Id) =>
          $(
            S.gets(getGroupById(id)),
            S.flatMap(
              O.match({
                onNone: () => S.modify<RootState>(identity),
                onSome: g =>
                  setUpsertGroupModal(some({ id: O.some(id), name: g.name })),
              }),
            ),
            StateRef.modify,
          ),
        close: (_: void) => StateRef.modify(setUpsertGroupModal(none())),
        form: { name: { change: $f(setUpsertGroupName, StateRef.modify) } },
        submit: (_: void) =>
          $(
            getSApp(root.at('ui').at('modalUpsertGroup')),
            S.map(O.filter(m => $(m.name, not(Str.isEmpty)))),
            StateRef.modify,
            F.flatMap(
              O.match({
                onNone: () => ignore(),
                onSome: m =>
                  $(
                    m.id,
                    O.match({
                      onNone: () => createGroup({ name: m.name }),
                      onSome: id =>
                        StateRef.modify(editGroup({ id, name: m.name })),
                    }),
                    F.tap(() => StateRef.modify(setUpsertGroupModal(O.none()))),
                  ),
              }),
            ),
          ),
      },
      delete: {
        open: (id: Id) => StateRef.modify(setDeleteGroupModal(some({ id }))),
        close: (_: void) => StateRef.modify(setDeleteGroupModal(none())),
        submit: (_: void) =>
          $(
            S.gets(Optic.get(root.at('ui').at('modalDeleteGroup'))),
            S.flatMap(
              O.match({
                onNone: () => S.of<RootState, void>(undefined),
                onSome: ({ id }) => deleteGroup({ id }),
              }),
            ),
            S.apFirst(setDeleteGroupModal(none())),
            StateRef.modify,
          ),
      },
    },
  },
  group: {
    menu: {
      open: (_: void) =>
        StateRef.modify(replaceSApp(root.at('ui').at('groupMenu'))(true)),
      close: (_: void) =>
        StateRef.modify(replaceSApp(root.at('ui').at('groupMenu'))(false)),
    },
    sort: {
      open: (_: void) =>
        pipe(
          replaceSApp(root.at('ui').at('modalSortGroup'))(O.some(null)),
          S.tap(() => replaceSApp(root.at('ui').at('groupMenu'))(false)),
          StateRef.modify,
        ),
      close: (_: void) =>
        StateRef.modify(
          replaceSApp(root.at('ui').at('modalSortGroup'))(O.none()),
        ),
      by: {
        name: (_: void) => $(onSelectGroupOrder('name'), StateRef.modify),
        position: (_: void) =>
          $(onSelectGroupOrder('position'), StateRef.modify),
        rating: (_: void) => $(onSelectGroupOrder('rating'), StateRef.modify),
        active: (_: void) => $(onSelectGroupOrder('active'), StateRef.modify),
        date: (_: void) => $(onSelectGroupOrder('date'), StateRef.modify),
      },
    },
    parameters: {
      open: (_: void) =>
        StateRef.modify(replaceSApp(root.at('ui').at('modalParameters'))(true)),
      close: (_: void) => StateRef.modify(closeParametersModal),
      teamsCount: {
        decrement: (_: void) => StateRef.modify(decrementTeamsCount),
        increment: (_: void) => StateRef.modify(incrementTeamsCount),
        toggleType: (_: void) =>
          $(
            modifySApp(root.at('parameters'))(Parameters_.toggleType),
            StateRef.modify,
          ),
      },
      position: { toggle: (_: void) => StateRef.modify(togglePosition) },
      rating: { toggle: (_: void) => StateRef.modify(toggleRating) },
      shuffle: (_: void) =>
        $(
          S.of<RootState, void>(undefined),
          S.flatMap(() => eraseResult),
          S.flatMap(() => navigate('Result')),
          S.flatMap(() => closeParametersModal),
          StateRef.modify,
          F.tap(() => F.sleep(0)),
          F.flatMap(() => generateResult),
        ),
    },
    export: (_: void) =>
      pipe(
        StateRef.modify(replaceSApp(root.at('ui').at('groupMenu'))(false)),
        F.tap(() => exportGroup()),
        F.ignore,
      ),
    player: {
      new: (_: void) =>
        $(
          navigate('Player'),
          S.flatMap(() =>
            $(
              replaceSApp(root.at('ui').at('selectedPlayerId'))(O.none()),
              S.apFirst(replaceSApp(root.at('playerForm'))(blankPlayerForm)),
            ),
          ),
          StateRef.modify,
        ),
      open: (playerId: Id) =>
        $(
          navigate('Player'),
          S.flatMap(() =>
            $(
              getPlayerFromActiveGroup({ playerId }),
              S.flatMap(
                O.match({
                  onNone: () => S.of<RootState, void>(undefined),
                  onSome: $f(
                    getPlayerFormFromData,
                    replaceSApp(root.at('playerForm')),
                    S.apFirst(
                      replaceSApp(root.at('ui').at('selectedPlayerId'))(
                        O.some(playerId),
                      ),
                    ),
                  ),
                }),
              ),
            ),
          ),
          StateRef.modify,
        ),
      active: {
        toggle: (id: Id) =>
          StateRef.modify(togglePlayerActive({ playerId: id })),
        toggleAll: (_: void) =>
          pipe(
            toggleAllPlayersActive,
            S.tap(() => replaceSApp(root.at('ui').at('groupMenu'))(false)),
            StateRef.modify,
          ),
      },
    },
  },
  player: {
    name: {
      change: $f(
        replaceSApp(root.at('playerForm').at('name')),
        StateRef.modify,
      ),
    },
    position: {
      change: $f(
        replaceSApp(root.at('playerForm').at('position')),
        StateRef.modify,
      ),
    },
    rating: {
      change: $f(
        (v: number) => Math.round(v * 20) / 2,
        D.parseOption(Rating.Schema),
        v => v,
        O.map(
          $f(replaceSApp(root.at('playerForm').at('rating')), StateRef.modify),
        ),
        O.getOrElse(() => F.unit),
      ),
    },
    delete: (_: void) =>
      $(deleteCurrentPlayer, S.apFirst(goBack), StateRef.modify),
    save: (_: void) =>
      $(
        Apply.sequenceS(S.Apply)({
          form: $(
            S.gets(get(root.at('playerForm'))),
            S.map(f => $(f, O.liftPredicate(not(() => Str.isEmpty(f.name))))),
          ),
          groupId: S.gets(get(root.at('ui').at('selectedGroupId'))),
          playerId: $(
            S.gets(get(root.at('ui').at('selectedPlayerId'))),
            S.map(O.some),
          ),
        }),
        S.map(O.all),
        StateRef.modify,
        F.flatMap(
          O.match({
            onNone: () => F.unit,
            onSome: ({ form, groupId, playerId }) =>
              $(
                playerId,
                O.match({
                  onNone: () => createPlayer({ groupId, player: form }),
                  onSome: id =>
                    StateRef.modify(
                      editPlayer({ groupId, player: { ...form, id } }),
                    ),
                }),
                F.flatMap(() => StateRef.modify(goBack)),
              ),
          }),
        ),
        v => v,
      ),
  },
  result: {
    share: (_: void) =>
      $(
        StateRef.modify(S.gets(get(root.at('result')))),
        F.flatMap(
          O.match({
            onNone: () => F.unit,
            onSome: $f(Player.TeamListShowSensitive.show, t =>
              ShareService.shareMessage({ message: t, title: 'Times' }),
            ),
          }),
        ),
      ),
  },
})

export const appEvents = makeEventConstructors(appEventsDefinition)<AppEvent>()
