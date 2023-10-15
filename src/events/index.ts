import {
  A,
  Effect,
  F,
  O,
  Optic,
  Record,
  S,
  String,
  constant,
  flow,
  not,
  pipe,
} from 'fp'
import { Parameters as Parameters_, Player, Rating } from 'src/datatypes'
import { exportGroup, importGroupFromDocumentPicker } from 'src/export/group'
import { root } from 'src/model/optic'
import { AppRequirements } from 'src/runtime'
import { Alert } from 'src/services/Alert'
import { IdGenerator } from 'src/services/IdGenerator'
import { ShareService } from 'src/services/Share'
import { SplashScreen } from 'src/services/SplashScreen'
import { State, StateRef } from 'src/services/StateRef'
import { onSelectGroupOrder } from 'src/slices/groupOrder'
import {
  adjustPlayerPosition,
  createGroup,
  createPlayer,
  deleteCurrentPlayer,
  deleteGroup,
  editGroup,
  editPlayer,
  getActiveModality,
  getModality,
  getPlayerFromSelectedGroup,
  getSelectedGroup,
  toggleAllPlayersActive,
  togglePlayerActive,
} from 'src/slices/groups'
import {
  blankPositionForm,
  initialModalityForm,
  validateModalityForm,
} from 'src/slices/modalityForm'
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
  setGroupModality,
  setGroupName,
} from 'src/slices/ui'
import { Id } from 'src/utils/Entity'
import { appLoaded, back } from './core'

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
  back: back,
  core: {
    uiMount: () => SplashScreen.hide(),
    appLoaded: appLoaded,
  },
  alert: { dismiss: () => Alert.dismiss() },
  modality: {
    go: () =>
      pipe(
        navigate(Route('Modalities')()),
        F.tap(() => State.on(root.at('ui').at('homeMenu')).set(false)),
        exec,
      ),
    new: () =>
      exec(
        F.all([
          State.on(root.at('modalityForm')).set(initialModalityForm),
          navigate(Route('ModalityForm')()),
        ]),
      ),
    open: (id: Id) =>
      pipe(
        State.with(getModality(id)),
        F.flatten,
        F.tap(m =>
          State.on(root.at('modalityForm')).set({
            id: O.some(id),
            name: m.name,
            positions: A.mapNonEmpty(m.positions, p => ({
              abbreviation: p.abbreviation.toUpperCase(),
              name: p.name,
              id: O.some(p.id),
            })),
          }),
        ),
        F.tap(() => navigate(Route('ModalityForm')())),
        exec,
        F.ignore,
      ),
    submit: () =>
      pipe(
        State.with(s => s.modalityForm),
        F.flatMap(validateModalityForm),
        F.flatMap(f =>
          F.all({
            id: F.orElse(f.id, () => IdGenerator.generate()),
            name: F.succeed(f.name),
            positions: F.all(
              A.mapNonEmpty(f.positions, p =>
                F.orElse(p.id, () => IdGenerator.generate()).pipe(
                  F.map(id => ({ ...p, id })),
                ),
              ),
            ),
          }),
        ),
        F.bindTo('nextModality'),
        F.bind('prevModality', ({ nextModality }) =>
          State.with(getModality(nextModality.id)),
        ),
        F.tap(({ nextModality }) =>
          State.on(root.at('modalities')).update(ms =>
            pipe(
              A.filter(ms, m => m.id !== nextModality.id),
              A.prepend(nextModality),
            ),
          ),
        ),
        F.tap(({ nextModality, prevModality }) =>
          pipe(
            prevModality,
            F.tap(prevModality =>
              State.on(root.at('groups')).update(
                Record.map(g =>
                  g.modalityId === prevModality.id
                    ? {
                        ...g,
                        players: A.map(
                          g.players,
                          adjustPlayerPosition({
                            prevModality: O.some(prevModality),
                            nextModality,
                          }),
                        ),
                      }
                    : g,
                ),
              ),
            ),
            F.optionFromOptional,
          ),
        ),
        exec,
        F.tap(() => back()),
        F.ignore,
      ),
    remove: {
      open: () =>
        pipe(
          State.with(s => s.modalityForm.id),
          F.flatMap(
            O.match({
              onNone: () => goBack,
              onSome: () =>
                State.on(root.at('ui').at('modalDeleteModality')).set(true),
            }),
          ),
          exec,
        ),
      close: () =>
        exec(State.on(root.at('ui').at('modalDeleteModality')).set(false)),
      submit: () =>
        pipe(
          State.with(s => s.modalityForm.id),
          F.flatten,
          F.flatMap(id => State.with(getModality(id))),
          F.flatten,
          F.bindTo('prevModality'),
          F.tap(({ prevModality }) =>
            State.on(root.at('modalities')).update(
              A.filter(m => m.id !== prevModality.id),
            ),
          ),
          F.bind('nextModality', () =>
            State.with(s => A.head(s.modalities)).pipe(F.flatten),
          ),
          F.tap(({ nextModality, prevModality }) =>
            State.on(root.at('groups')).update(
              Record.map(g =>
                g.modalityId === prevModality.id
                  ? {
                      ...g,
                      modalityId: nextModality.id,
                      players: A.map(
                        g.players,
                        adjustPlayerPosition({
                          prevModality: O.some(prevModality),
                          nextModality,
                        }),
                      ),
                    }
                  : g,
              ),
            ),
          ),
          F.tap(() => goBack),
          F.tap(() =>
            State.on(root.at('ui').at('modalDeleteModality')).set(false),
          ),
          exec,
          F.ignore,
        ),
    },
    name: {
      change: flow(State.on(root.at('modalityForm').at('name')).set, exec),
    },
    position: {
      add: () =>
        exec(
          State.on(root.at('modalityForm').at('positions')).update(
            A.append(blankPositionForm),
          ),
        ),
      remove: (index: number) =>
        exec(
          State.on(root.at('modalityForm').at('positions')).update(
            flow(
              A.remove(index),
              A.toNonEmpty,
              O.getOrElse(() => A.of(blankPositionForm)),
            ),
          ),
        ),
      lift: (index: number) =>
        exec(
          State.on(root.at('modalityForm').at('positions')).update(as =>
            pipe(
              A.get(as, index),
              O.flatMap(a =>
                pipe(A.remove(as, index), A.insertAt(index - 1, a)),
              ),
              O.getOrElse(() => as),
            ),
          ),
        ),
      abbreviation: {
        change: (args: { index: number; value: string }) =>
          exec(
            State.onOption(
              root
                .at('modalityForm')
                .at('positions')
                .compose(Optic.nonEmptyIndex(args.index))
                .at('abbreviation'),
            ).set(args.value.slice(0, 3).toUpperCase()),
          ),
      },
      name: {
        change: (args: { index: number; value: string }) =>
          exec(
            State.onOption(
              root
                .at('modalityForm')
                .at('positions')
                .compose(Optic.nonEmptyIndex(args.index))
                .at('name'),
            ).set(args.value),
          ),
      },
    },
  },

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
          pipe(
            State.with(s => A.head(s.modalities)),
            F.flatMap(m =>
              State.on(root.at('groupForm')).set({
                id: O.none(),
                name: '',
                modalityId: O.map(m, _ => _.id),
              }),
            ),
            F.tap(() => navigate(Route('GroupForm')())),
            exec,
          ),
        edit: () =>
          pipe(
            State.with(getSelectedGroup),
            F.flatten,
            F.flatMap(g =>
              State.on(root.at('groupForm')).set({
                id: O.some(g.id),
                name: g.name,
                modalityId: O.some(g.modalityId),
              }),
            ),
            F.tap(() => navigate(Route('GroupForm')())),
            F.tap(() => State.on(root.at('ui').at('groupMenu')).set(false)),
            exec,
            F.ignore,
          ),
        form: {
          name: { change: flow(setGroupName, exec) },
          modality: { change: flow(setGroupModality, exec) },
        },
        submit: () =>
          pipe(
            State.with(s => s.groupForm),
            F.filterOrElse(
              f => not(String.isEmpty)(f.name),
              () => O.none(),
            ),
            F.flatMap(f =>
              O.map(f.modalityId, mId => ({ ...f, modalityId: mId })),
            ),
            F.flatMap(m =>
              O.match(m.id, {
                onNone: () => createGroup(m),
                onSome: id => editGroup({ ...m, id }),
              }),
            ),
            F.tap(() => goBack),
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
          State.on(root.at('ui').at('modalSortGroup')).set(true),
          F.tap(() => State.on(root.at('ui').at('groupMenu')).set(false)),
          exec,
        ),
      close: () =>
        exec(State.on(root.at('ui').at('modalSortGroup')).set(false)),
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
        ).pipe(F.ignore),
    },
    export: () =>
      pipe(
        State.on(root.at('ui').at('groupMenu')).set(false),
        exec,
        F.tap(() => exportGroup()),
        F.ignore,
      ),
    delete: {
      open: () => exec(setDeleteGroupModal(true)),
      close: () => exec(setDeleteGroupModal(false)),
      submit: () =>
        pipe(
          State.with(getSelectedGroup),
          F.flatten,
          F.flatMap(({ id }) => deleteGroup({ id })),
          F.tap(() => setDeleteGroupModal(false)),
          F.tap(() => State.on(root.at('ui').at('groupMenu')).set(false)),
          F.tap(() => goBack),
          exec,
          F.ignore,
        ),
    },
    player: {
      new: () =>
        pipe(
          navigate(Route('Player')()),
          F.tap(() =>
            State.on(root.at('ui').at('selectedPlayerId')).set(O.none()),
          ),
          F.flatMap(() => State.with(getActiveModality).pipe(F.flatten)),
          F.tap(m =>
            State.on(root.at('playerForm')).set(
              blankPlayerForm({ modality: m }),
            ),
          ),
          exec,
        ).pipe(F.ignore),
      open: (playerId: Id) =>
        pipe(
          navigate(Route('Player')()),
          F.flatMap(() =>
            State.with(getPlayerFromSelectedGroup({ playerId })).pipe(
              F.flatten,
            ),
          ),
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
      change: flow(State.on(root.at('playerForm').at('positionId')).set, exec),
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
        F.all({
          result: State.with(s => s.result).pipe(F.flatten),
          modality: State.with(getActiveModality).pipe(F.flatten),
        }),
        StateRef.query,
        F.flatMap(({ result, modality }) =>
          pipe(Player.teamListToStringSensitive({ modality })(result), t =>
            ShareService.shareMessage({ message: t, title: 'Times' }),
          ),
        ),
        F.ignore,
      ),
  },
} satisfies AppEventTree
