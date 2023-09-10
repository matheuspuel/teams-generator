import {
  $,
  $f,
  D,
  Effect,
  F,
  O,
  Str,
  constant,
  flow,
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
import { State, StateRef } from 'src/services/StateRef'
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

const exec = StateRef.execute

const defineEvents: <T extends AnyEventTree>(tree: T) => T = identity

const noArg: <A>(a: A) => () => A = constant
const ignore = noArg(F.unit)

const closeParametersModal = State.on(root.at('ui').at('modalParameters')).set(
  false,
)

export const appEvents = defineEvents({
  doNothing: ignore,
  back: () =>
    $(
      State.modify(goBack),
      exec,
      F.tap(({ shouldBubbleUpEvent }) =>
        shouldBubbleUpEvent ? BackHandler.exit() : F.unit,
      ),
    ),
  core: {
    preventSplashScreenAutoHide: () => SplashScreen.preventAutoHide(),
    uiMount: () => SplashScreen.hide(),
    appLoaded: () => exec(State.on(root.at('core').at('isLoaded')).set(true)),
    saveState: () => saveState,
  },
  alert: { dismiss: () => Alert.dismiss() },
  groups: {
    menu: {
      open: () => exec(State.on(root.at('ui').at('homeMenu')).set(true)),
      close: () => exec(State.on(root.at('ui').at('homeMenu')).set(false)),
    },
    import: () =>
      pipe(
        State.on(root.at('ui').at('homeMenu')).set(false),
        exec,
        F.tap(() => importGroupFromDocumentPicker()),
        F.ignore,
      ),
    item: {
      open: (id: Id) =>
        pipe(
          navigate('Group'),
          F.tap(() =>
            State.on(root.at('ui').at('selectedGroupId')).set(O.some(id)),
          ),
          exec,
        ),
      upsert: {
        new: () => exec(setUpsertGroupModal(some({ id: O.none(), name: '' }))),
        edit: (id: Id) =>
          $(
            State.get,
            F.flatMap(getGroupById(id)),
            F.flatMap(g =>
              setUpsertGroupModal(some({ id: O.some(id), name: g.name })),
            ),
            exec,
            F.ignore,
          ),
        close: () => exec(setUpsertGroupModal(none())),
        form: { name: { change: flow(setUpsertGroupName, exec) } },
        submit: () =>
          pipe(
            State.on(root.at('ui').at('modalUpsertGroup')).get,
            F.flatMap(O.filter(m => $(m.name, not(Str.isEmpty)))),
            F.flatMap(m =>
              $(
                m.id,
                O.match({
                  onNone: () => createGroup({ name: m.name }),
                  onSome: id => editGroup({ id, name: m.name }),
                }),
                F.tap(() => setUpsertGroupModal(O.none())),
              ),
            ),
            exec,
            F.ignore,
          ),
      },
      delete: {
        open: (id: Id) => exec(setDeleteGroupModal(some({ id }))),
        close: () => exec(setDeleteGroupModal(none())),
        submit: () =>
          $(
            State.on(root.at('ui').at('modalDeleteGroup')).get,
            F.flatten,
            F.flatMap(({ id }) => deleteGroup({ id })),
            F.tap(() => setDeleteGroupModal(none())),
            exec,
            F.ignore,
          ),
      },
    },
  },
  group: {
    menu: {
      open: () => exec(State.on(root.at('ui').at('groupMenu')).set(true)),
      close: () => exec(State.on(root.at('ui').at('groupMenu')).set(false)),
    },
    sort: {
      open: () =>
        pipe(
          State.on(root.at('ui').at('modalSortGroup')).set(O.some(null)),
          F.tap(() => State.on(root.at('ui').at('groupMenu')).set(false)),
          exec,
        ),
      close: () =>
        exec(State.on(root.at('ui').at('modalSortGroup')).set(O.none())),
      by: {
        name: () => exec(onSelectGroupOrder('name')),
        position: () => exec(onSelectGroupOrder('position')),
        rating: () => exec(onSelectGroupOrder('rating')),
        active: () => exec(onSelectGroupOrder('active')),
        date: () => exec(onSelectGroupOrder('date')),
      },
    },
    parameters: {
      open: () => exec(State.on(root.at('ui').at('modalParameters')).set(true)),
      close: () => exec(closeParametersModal),
      teamsCount: {
        decrement: () => exec(decrementTeamsCount),
        increment: () => exec(incrementTeamsCount),
        toggleType: () =>
          exec(State.on(root.at('parameters')).update(Parameters_.toggleType)),
      },
      position: { toggle: () => exec(togglePosition) },
      rating: { toggle: () => exec(toggleRating) },
      shuffle: () =>
        $(
          F.unit,
          F.flatMap(() => eraseResult),
          F.flatMap(() => navigate('Result')),
          F.flatMap(() => closeParametersModal),
          exec,
          F.tap(() => F.sleep(0)),
          F.flatMap(() => generateResult),
        ),
    },
    export: () =>
      pipe(
        State.on(root.at('ui').at('groupMenu')).set(false),
        exec,
        F.tap(() => exportGroup()),
        F.ignore,
      ),
    player: {
      new: () =>
        pipe(
          navigate('Player'),
          F.tap(() =>
            State.on(root.at('ui').at('selectedPlayerId')).set(O.none()),
          ),
          F.tap(() => State.on(root.at('playerForm')).set(blankPlayerForm)),
          exec,
        ),
      open: (playerId: Id) =>
        pipe(
          navigate('Player'),
          F.flatMap(() => getPlayerFromActiveGroup({ playerId })),
          F.flatten,
          F.flatMap(v =>
            pipe(
              State.on(root.at('playerForm')).set(getPlayerFormFromData(v)),
              F.tap(() =>
                State.on(root.at('ui').at('selectedPlayerId')).set(
                  O.some(playerId),
                ),
              ),
            ),
          ),
          exec,
          F.ignore,
        ),
      active: {
        toggle: (id: Id) => exec(togglePlayerActive({ playerId: id })),
        toggleAll: () =>
          pipe(
            State.update(toggleAllPlayersActive),
            F.tap(() => State.on(root.at('ui').at('groupMenu')).set(false)),
            exec,
          ),
      },
    },
  },
  player: {
    name: {
      change: flow(State.on(root.at('playerForm').at('name')).set, exec),
    },
    position: {
      change: flow(State.on(root.at('playerForm').at('position')).set, exec),
    },
    rating: {
      change: flow(
        (v: number) => Math.round(v * 20) / 2,
        D.parseOption(Rating.Schema),
        O.map(flow(State.on(root.at('playerForm').at('rating')).set, exec)),
        O.getOrElse(() => F.unit),
      ),
    },
    delete: () =>
      pipe(
        State.update(deleteCurrentPlayer),
        F.tap(() => State.modify(goBack)),
        exec,
      ),
    save: () =>
      pipe(
        F.all({
          form: pipe(
            State.on(root.at('playerForm')).get,
            F.flatMap(f =>
              $(f, O.liftPredicate(not(() => Str.isEmpty(f.name)))),
            ),
          ),
          groupId: F.flatten(State.on(root.at('ui').at('selectedGroupId')).get),
          playerId: State.on(root.at('ui').at('selectedPlayerId')).get,
        }),
        F.flatMap(({ form, groupId, playerId }) =>
          $(
            playerId,
            O.match({
              onNone: () => createPlayer({ groupId, player: form }),
              onSome: id => editPlayer({ groupId, player: { ...form, id } }),
            }),
            F.flatMap(() => State.modify(goBack)),
          ),
        ),
        exec,
        F.ignore,
      ),
  },
  result: {
    share: () =>
      pipe(
        State.on(root.at('result')).get,
        StateRef.query,
        F.flatten,
        F.flatMap(
          $f(Player.TeamListShowSensitive.show, t =>
            ShareService.shareMessage({ message: t, title: 'Times' }),
          ),
        ),
        F.ignore,
      ),
  },
})
