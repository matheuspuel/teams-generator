import { Effect, F, O, S, String, constant, flow, not, pipe } from 'fp'
import { Parameters as Parameters_, Player, Rating } from 'src/datatypes'
import { exportGroup, importGroupFromDocumentPicker } from 'src/export/group'
import { root } from 'src/model/optic'
import { AppRequirements } from 'src/runtime'
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
import { Route, goBack, navigate } from 'src/slices/routes'
import {
  setDeleteGroupModal,
  setUpsertGroupModal,
  setUpsertGroupName,
} from 'src/slices/ui'
import { Id } from 'src/utils/Entity'

type EventLeaf<R, A> = (payload: A) => Effect<R, never, void>

export type EventTree<R> = {
  [k: string]: EventLeaf<R, never> | EventTree<R>
}

export type AppEventTree = EventTree<AppRequirements>

export type AppEvent = Effect<AppRequirements, never, unknown>

const exec = StateRef.execute

const noArg: <A>(a: A) => () => A = constant
const ignore = noArg(F.unit)

const closeParametersModal = State.on(root.at('ui').at('modalParameters')).set(
  false,
)

export const appEvents = {
  doNothing: ignore,
  back: () =>
    pipe(
      goBack,
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
          navigate(Route('Group')()),
          F.tap(() =>
            State.on(root.at('ui').at('selectedGroupId')).set(O.some(id)),
          ),
          exec,
        ),
      upsert: {
        new: () =>
          exec(setUpsertGroupModal(O.some({ id: O.none(), name: '' }))),
        edit: (id: Id) =>
          pipe(
            State.get,
            F.flatMap(getGroupById(id)),
            F.flatMap(g =>
              setUpsertGroupModal(O.some({ id: O.some(id), name: g.name })),
            ),
            exec,
            F.ignore,
          ),
        close: () => exec(setUpsertGroupModal(O.none())),
        form: { name: { change: flow(setUpsertGroupName, exec) } },
        submit: () =>
          pipe(
            State.on(root.at('ui').at('modalUpsertGroup')).get,
            F.flatMap(O.filter(m => pipe(m.name, not(String.isEmpty)))),
            F.flatMap(m =>
              pipe(
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
        open: (id: Id) => exec(setDeleteGroupModal(O.some({ id }))),
        close: () => exec(setDeleteGroupModal(O.none())),
        submit: () =>
          pipe(
            State.on(root.at('ui').at('modalDeleteGroup')).get,
            F.flatten,
            F.flatMap(({ id }) => deleteGroup({ id })),
            F.tap(() => setDeleteGroupModal(O.none())),
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
        pipe(
          F.unit,
          F.flatMap(() => eraseResult),
          F.flatMap(() => navigate(Route('Result')())),
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
          navigate(Route('Player')()),
          F.tap(() =>
            State.on(root.at('ui').at('selectedPlayerId')).set(O.none()),
          ),
          F.tap(() => State.on(root.at('playerForm')).set(blankPlayerForm)),
          exec,
        ),
      open: (playerId: Id) =>
        pipe(
          navigate(Route('Player')()),
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
        S.parseOption(Rating.Schema),
        O.map(flow(State.on(root.at('playerForm').at('rating')).set, exec)),
        O.getOrElse(() => F.unit),
      ),
    },
    delete: () =>
      pipe(
        State.update(deleteCurrentPlayer),
        F.tap(() => goBack),
        exec,
      ),
    save: () =>
      pipe(
        F.all({
          form: pipe(
            State.on(root.at('playerForm')).get,
            F.flatMap(f =>
              pipe(f, O.liftPredicate(not(() => String.isEmpty(f.name)))),
            ),
          ),
          groupId: F.flatten(State.on(root.at('ui').at('selectedGroupId')).get),
          playerId: State.on(root.at('ui').at('selectedPlayerId')).get,
        }),
        F.flatMap(({ form, groupId, playerId }) =>
          pipe(
            playerId,
            O.match({
              onNone: () => createPlayer({ groupId, player: form }),
              onSome: id => editPlayer({ groupId, player: { ...form, id } }),
            }),
            F.flatMap(() => goBack),
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
          flow(Player.teamListToStringSensitive, t =>
            ShareService.shareMessage({ message: t, title: 'Times' }),
          ),
        ),
        F.ignore,
      ),
  },
} satisfies AppEventTree
