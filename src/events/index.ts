import { A, Effect, F, O, Optic, Record, S, String, flow, not, pipe } from 'fp'
import {
  Modality,
  Parameters as Parameters_,
  Player,
  Rating,
} from 'src/datatypes'
import { soccer } from 'src/datatypes/Modality'
import { exportGroup, importGroupFromDocumentPicker } from 'src/export/group'
import { t } from 'src/i18n'
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
import { Id } from 'src/utils/Entity'
import { appLoaded, back } from './core'

type EventLeaf<R, A> = (payload: A) => Effect<void, never, R>

export type EventTree<R> = {
  [k: string]: EventLeaf<R, never> | EventTree<R>
}

export type AppEventTree = EventTree<AppRequirements>

export type AppEvent = Effect<unknown, never, AppRequirements>

const exec = StateRef.execute

export const appEvents = {
  back: back,
  core: {
    uiMount: () => SplashScreen.hide(),
    appLoaded: appLoaded,
  },
  alert: { dismiss: () => Alert.dismiss() },
  modality: {
    go: () => exec(F.all([goBack, navigate(Route.Modalities())])),
    new: () =>
      exec(
        F.all([
          State.on(root.at('modalityForm')).set(initialModalityForm),
          navigate(Route.ModalityForm()),
        ]),
      ),
    open: (modality: Modality.Reference) =>
      pipe(
        State.with(getModality(modality)),
        F.flatten,
        F.flatMap(m => (m._tag === 'StaticModality' ? O.none() : O.some(m))),
        F.tap(m =>
          State.on(root.at('modalityForm')).set({
            id: O.some(m.id),
            name: m.name,
            positions: A.map(m.positions, p => ({
              abbreviation: p.abbreviation.toUpperCase(),
              name: p.name,
              oldAbbreviation: O.some(p.abbreviation),
            })),
          }),
        ),
        F.tap(() => navigate(Route.ModalityForm())),
        exec,
        F.ignore,
      ),
    submit: () =>
      pipe(
        State.with(s => s.modalityForm),
        F.flatMap(validateModalityForm),
        F.flatMap(f =>
          F.all({
            _tag: F.succeed('CustomModality' as const),
            id: F.orElse(f.id, () => IdGenerator.generate()),
            name: F.succeed(f.name),
            positions: F.succeed(f.positions),
          }),
        ),
        F.bindTo('nextModality'),
        F.bind('prevModality', ({ nextModality }) =>
          State.with(
            getModality({ _tag: 'CustomModality', id: nextModality.id }),
          ),
        ),
        F.tap(({ nextModality }) =>
          State.on(root.at('customModalities')).update(ms =>
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
                  g.modality.id === prevModality.id
                    ? {
                        ...g,
                        players: A.map(
                          g.players,
                          adjustPlayerPosition({
                            prevModality: O.some(prevModality),
                            nextModality: {
                              _tag: 'edited',
                              modality: nextModality,
                            },
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
              onSome: () => navigate(Route.DeleteModality()),
            }),
          ),
          exec,
        ),
      submit: () =>
        pipe(
          State.with(s => s.modalityForm.id),
          F.flatten,
          F.flatMap(id =>
            State.with(getModality({ _tag: 'CustomModality', id })),
          ),
          F.flatten,
          F.bindTo('prevModality'),
          F.tap(({ prevModality }) =>
            State.on(root.at('customModalities')).update(
              A.filter(m => m.id !== prevModality.id),
            ),
          ),
          F.bind('nextModality', () =>
            State.with(s =>
              A.head(s.customModalities).pipe(O.getOrElse(() => soccer)),
            ),
          ),
          F.tap(({ nextModality, prevModality }) =>
            State.on(root.at('groups')).update(
              Record.map(g =>
                g.modality.id === prevModality.id
                  ? {
                      ...g,
                      modality:
                        nextModality._tag === 'CustomModality'
                          ? { _tag: nextModality._tag, id: nextModality.id }
                          : { _tag: nextModality._tag, id: nextModality.id },
                      players: A.map(
                        g.players,
                        adjustPlayerPosition({
                          prevModality: O.some(prevModality),
                          nextModality: {
                            _tag: 'unchanged',
                            modality: nextModality,
                          },
                        }),
                      ),
                    }
                  : g,
              ),
            ),
          ),
          F.tap(() => goBack),
          F.tap(() => goBack),
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
      open: () => exec(navigate(Route.HomeMenu())),
    },
    import: () =>
      pipe(
        goBack,
        exec,
        F.tap(() => importGroupFromDocumentPicker()),
        F.ignore,
      ),
    item: {
      open: (id: Id) =>
        pipe(
          navigate(Route.Group()),
          F.tap(() =>
            State.on(root.at('ui').at('selectedGroupId')).set(O.some(id)),
          ),
          exec,
        ),
      upsert: {
        new: () =>
          pipe(
            State.with(s =>
              A.head(s.customModalities).pipe(O.getOrElse(() => soccer)),
            ),
            F.flatMap(m =>
              State.on(root.at('groupForm')).set({
                id: O.none(),
                name: '',
                modality: m,
              }),
            ),
            F.tap(() => navigate(Route.GroupForm())),
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
                modality: g.modality,
              }),
            ),
            F.tap(goBack),
            F.tap(() => navigate(Route.GroupForm())),
            exec,
            F.ignore,
          ),
        form: {
          name: {
            change: flow(State.on(root.at('groupForm').at('name')).set, exec),
          },
          modality: {
            change: flow(
              State.on(root.at('groupForm').at('modality')).set,
              exec,
            ),
          },
        },
        submit: () =>
          pipe(
            State.with(s => s.groupForm),
            F.filterOrElse(
              f => not(String.isEmpty)(f.name),
              () => O.none(),
            ),
            F.flatMap(g =>
              O.match(g.id, {
                onNone: () => createGroup(g),
                onSome: id => editGroup({ ...g, id }),
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
      open: () => exec(navigate(Route.GroupMenu())),
    },
    sort: {
      open: () => pipe(goBack, F.tap(navigate(Route.SortGroup())), exec),
      by: {
        name: () => exec(onSelectGroupOrder('name')),
        position: () => exec(onSelectGroupOrder('position')),
        rating: () => exec(onSelectGroupOrder('rating')),
        active: () => exec(onSelectGroupOrder('active')),
        date: () => exec(onSelectGroupOrder('date')),
      },
    },
    parameters: {
      open: () => exec(navigate(Route.Parameters())),
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
          F.all([eraseResult, goBack, navigate(Route.Result())]),
          exec,
          F.tap(() => F.sleep(0)),
          F.flatMap(() => generateResult),
        ).pipe(F.ignore),
    },
    export: () =>
      pipe(
        goBack,
        exec,
        F.tap(() => exportGroup()),
        F.ignore,
      ),
    delete: {
      open: () => exec(F.all([goBack, navigate(Route.DeleteGroup())])),
      submit: () =>
        pipe(
          State.with(getSelectedGroup),
          F.flatten,
          F.flatMap(({ id }) => deleteGroup({ id })),
          F.tap(goBack),
          F.tap(goBack),
          F.tap(goBack),
          exec,
          F.ignore,
        ),
    },
    player: {
      new: () =>
        pipe(
          navigate(Route.Player()),
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
          navigate(Route.Player()),
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
          pipe(State.update(toggleAllPlayersActive), F.tap(goBack), exec),
      },
    },
  },
  player: {
    name: {
      change: flow(State.on(root.at('playerForm').at('name')).set, exec),
    },
    position: {
      change: flow(
        State.on(root.at('playerForm').at('positionAbbreviation')).set,
        exec,
      ),
    },
    rating: {
      change: flow(
        (v: number) => Math.round(v * 20) / 2,
        S.decodeUnknownOption(Rating.Schema),
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
          pipe(Player.teamListToStringSensitive({ modality })(result), _ =>
            ShareService.shareMessage({ message: _, title: t('Teams') }),
          ),
        ),
        F.ignore,
      ),
  },
} satisfies AppEventTree
