import {
  $,
  $f,
  D,
  Effect,
  F,
  O,
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
import { root } from 'src/model/optic'
import { Alert } from 'src/services/Alert'
import { BackHandler } from 'src/services/BackHandler'
import { ShareService } from 'src/services/Share'
import { SplashScreen } from 'src/services/SplashScreen'
import { StateRef } from 'src/services/StateRef'
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
import { AnyEventTree, EventEnvFromTree } from './helpers'

export type AppEvent = Effect<
  EventEnvFromTree<typeof appEvents>,
  never,
  unknown
>

const defineEvents: <T extends AnyEventTree>(tree: T) => T = identity

const noArg: <A>(a: A) => () => A = constant
const ignore = noArg(F.unit)

const closeParametersModal = StateRef.on(
  root.at('ui').at('modalParameters'),
).set(false)

export const appEvents = defineEvents({
  doNothing: ignore,
  back: () =>
    $(
      StateRef.modify(goBack),
      F.tap(({ shouldBubbleUpEvent }) =>
        shouldBubbleUpEvent ? BackHandler.exit() : F.unit,
      ),
    ),
  core: {
    preventSplashScreenAutoHide: () => SplashScreen.preventAutoHide(),
    uiMount: () => SplashScreen.hide(),
    appLoaded: () => StateRef.on(root.at('core').at('isLoaded')).set(true),
    saveState: () => saveState,
  },
  alert: { dismiss: () => Alert.dismiss() },
  groups: {
    menu: {
      open: () => StateRef.on(root.at('ui').at('homeMenu')).set(true),
      close: () => StateRef.on(root.at('ui').at('homeMenu')).set(false),
    },
    import: () =>
      pipe(
        StateRef.on(root.at('ui').at('homeMenu')).set(false),
        F.tap(() => importGroupFromDocumentPicker()),
        F.ignore,
      ),
    item: {
      open: (id: Id) =>
        pipe(
          navigate('Group'),
          F.flatMap(() =>
            StateRef.on(root.at('ui').at('selectedGroupId')).set(O.some(id)),
          ),
        ),
      upsert: {
        new: () => setUpsertGroupModal(some({ id: O.none(), name: '' })),
        edit: (id: Id) =>
          $(
            StateRef.get,
            F.map(getGroupById(id)),
            F.flatMap(
              O.match({
                onNone: () => F.unit,
                onSome: g =>
                  setUpsertGroupModal(some({ id: O.some(id), name: g.name })),
              }),
            ),
          ),
        close: () => setUpsertGroupModal(none()),
        form: { name: { change: setUpsertGroupName } },
        submit: () =>
          $(
            StateRef.on(root.at('ui').at('modalUpsertGroup')).get,
            F.map(O.filter(m => $(m.name, not(Str.isEmpty)))),
            F.flatMap(
              O.match({
                onNone: () => F.unit,
                onSome: m =>
                  $(
                    m.id,
                    O.match({
                      onNone: () => createGroup({ name: m.name }),
                      onSome: id => editGroup({ id, name: m.name }),
                    }),
                    F.tap(() => setUpsertGroupModal(O.none())),
                  ),
              }),
            ),
          ),
      },
      delete: {
        open: (id: Id) => setDeleteGroupModal(some({ id })),
        close: () => setDeleteGroupModal(none()),
        submit: () =>
          $(
            StateRef.on(root.at('ui').at('modalDeleteGroup')).get,
            F.flatMap(
              O.match({
                onNone: () => F.unit,
                onSome: ({ id }) => deleteGroup({ id }),
              }),
            ),
            F.tap(() => setDeleteGroupModal(none())),
          ),
      },
    },
  },
  group: {
    menu: {
      open: () => StateRef.on(root.at('ui').at('groupMenu')).set(true),
      close: () => StateRef.on(root.at('ui').at('groupMenu')).set(false),
    },
    sort: {
      open: () =>
        pipe(
          StateRef.on(root.at('ui').at('modalSortGroup')).set(O.some(null)),
          F.tap(() => StateRef.on(root.at('ui').at('groupMenu')).set(false)),
        ),
      close: () =>
        StateRef.on(root.at('ui').at('modalSortGroup')).set(O.none()),
      by: {
        name: () => onSelectGroupOrder('name'),
        position: () => onSelectGroupOrder('position'),
        rating: () => onSelectGroupOrder('rating'),
        active: () => onSelectGroupOrder('active'),
        date: () => onSelectGroupOrder('date'),
      },
    },
    parameters: {
      open: () => StateRef.on(root.at('ui').at('modalParameters')).set(true),
      close: () => closeParametersModal,
      teamsCount: {
        decrement: () => decrementTeamsCount,
        increment: () => incrementTeamsCount,
        toggleType: () =>
          StateRef.on(root.at('parameters')).update(Parameters_.toggleType),
      },
      position: { toggle: () => togglePosition },
      rating: { toggle: () => toggleRating },
      shuffle: () =>
        $(
          F.unit,
          F.flatMap(() => eraseResult),
          F.flatMap(() => navigate('Result')),
          F.flatMap(() => closeParametersModal),
          F.tap(() => F.sleep(0)),
          F.flatMap(() => generateResult),
        ),
    },
    export: () =>
      pipe(
        StateRef.on(root.at('ui').at('groupMenu')).set(false),
        F.tap(() => exportGroup()),
        F.ignore,
      ),
    player: {
      new: () =>
        $(
          navigate('Player'),
          F.flatMap(() =>
            StateRef.on(root.at('ui').at('selectedPlayerId')).set(O.none()),
          ),
          F.tap(() => StateRef.on(root.at('playerForm')).set(blankPlayerForm)),
        ),
      open: (playerId: Id) =>
        $(
          navigate('Player'),
          F.flatMap(() =>
            $(
              getPlayerFromActiveGroup({ playerId }),
              F.flatMap(
                O.match({
                  onNone: () => F.unit,
                  onSome: v =>
                    pipe(
                      StateRef.on(root.at('playerForm')).set(
                        getPlayerFormFromData(v),
                      ),
                      F.tap(() =>
                        StateRef.on(root.at('ui').at('selectedPlayerId')).set(
                          O.some(playerId),
                        ),
                      ),
                    ),
                }),
              ),
            ),
          ),
        ),
      active: {
        toggle: (id: Id) => togglePlayerActive({ playerId: id }),
        toggleAll: () =>
          pipe(
            StateRef.update(toggleAllPlayersActive),
            F.tap(() => StateRef.on(root.at('ui').at('groupMenu')).set(false)),
          ),
      },
    },
  },
  player: {
    name: {
      change: StateRef.on(root.at('playerForm').at('name')).set,
    },
    position: {
      change: StateRef.on(root.at('playerForm').at('position')).set,
    },
    rating: {
      change: $f(
        (v: number) => Math.round(v * 20) / 2,
        D.parseOption(Rating.Schema),
        O.map($f(StateRef.on(root.at('playerForm').at('rating')).set)),
        O.getOrElse(() => F.unit),
      ),
    },
    delete: () =>
      pipe(
        StateRef.update(deleteCurrentPlayer),
        F.tap(() => StateRef.modify(goBack)),
      ),
    save: () =>
      $(
        F.all({
          form: pipe(
            StateRef.on(root.at('playerForm')).get,
            F.map(f => $(f, O.liftPredicate(not(() => Str.isEmpty(f.name))))),
          ),
          groupId: StateRef.on(root.at('ui').at('selectedGroupId')).get,
          playerId: pipe(
            StateRef.on(root.at('ui').at('selectedPlayerId')).get,
            F.map(O.some),
          ),
        }),
        F.map(O.all),
        F.flatMap(
          O.match({
            onNone: () => F.unit,
            onSome: ({ form, groupId, playerId }) =>
              $(
                playerId,
                O.match({
                  onNone: () => createPlayer({ groupId, player: form }),
                  onSome: id =>
                    editPlayer({ groupId, player: { ...form, id } }),
                }),
                F.flatMap(() => StateRef.modify(goBack)),
              ),
          }),
        ),
      ),
  },
  result: {
    share: () =>
      pipe(
        StateRef.on(root.at('result')).get,
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
