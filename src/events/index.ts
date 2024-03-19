import { Schema } from '@effect/schema'
import {
  Effect,
  Option,
  ReadonlyArray,
  ReadonlyRecord,
  String,
  flow,
  pipe,
} from 'effect'
import { not } from 'effect/Predicate'
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
import { toNonEmpty } from 'src/utils/fp/Array'
import { nonEmptyIndex } from 'src/utils/fp/Optic'
import { appLoaded, back } from './core'

type EventLeaf<R, A> = (payload: A) => Effect.Effect<void, never, R>

export type EventTree<R> = {
  [k: string]: EventLeaf<R, never> | EventTree<R>
}

export type AppEventTree = EventTree<AppRequirements>

export type AppEvent = Effect.Effect<unknown, never, AppRequirements>

const exec = StateRef.execute

export const appEvents = {
  back: back,
  core: {
    uiMount: () => SplashScreen.hide(),
    appLoaded: appLoaded,
  },
  alert: { dismiss: () => Alert.dismiss() },
  modality: {
    go: () => exec(Effect.all([goBack, navigate(Route.Modalities())])),
    new: () =>
      exec(
        Effect.all([
          State.on(root.at('modalityForm')).set(initialModalityForm),
          navigate(Route.ModalityForm()),
        ]),
      ),
    open: (modality: Modality.Reference) =>
      pipe(
        State.with(getModality(modality)),
        Effect.flatten,
        Effect.flatMap(m =>
          m._tag === 'StaticModality' ? Option.none() : Option.some(m),
        ),
        Effect.tap(m =>
          State.on(root.at('modalityForm')).set({
            id: Option.some(m.id),
            name: m.name,
            positions: ReadonlyArray.map(m.positions, p => ({
              abbreviation: p.abbreviation.toUpperCase(),
              name: p.name,
              oldAbbreviation: Option.some(p.abbreviation),
            })),
          }),
        ),
        Effect.tap(() => navigate(Route.ModalityForm())),
        exec,
        Effect.ignore,
      ),
    submit: () =>
      pipe(
        State.with(s => s.modalityForm),
        Effect.flatMap(validateModalityForm),
        Effect.flatMap(f =>
          Effect.all({
            _tag: Effect.succeed('CustomModality' as const),
            id: Effect.orElse(f.id, () => IdGenerator.generate()),
            name: Effect.succeed(f.name),
            positions: Effect.succeed(f.positions),
          }),
        ),
        Effect.bindTo('nextModality'),
        Effect.bind('prevModality', ({ nextModality }) =>
          State.with(
            getModality({ _tag: 'CustomModality', id: nextModality.id }),
          ),
        ),
        Effect.tap(({ nextModality }) =>
          State.on(root.at('customModalities')).update(ms =>
            pipe(
              ReadonlyArray.filter(ms, m => m.id !== nextModality.id),
              ReadonlyArray.prepend(nextModality),
            ),
          ),
        ),
        Effect.tap(({ nextModality, prevModality }) =>
          pipe(
            prevModality,
            Effect.tap(prevModality =>
              State.on(root.at('groups')).update(
                ReadonlyRecord.map(g =>
                  g.modality.id === prevModality.id
                    ? {
                        ...g,
                        players: ReadonlyArray.map(
                          g.players,
                          adjustPlayerPosition({
                            prevModality: Option.some(prevModality),
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
            Effect.optionFromOptional,
          ),
        ),
        exec,
        Effect.tap(() => back()),
        Effect.ignore,
      ),
    remove: {
      open: () =>
        pipe(
          State.with(s => s.modalityForm.id),
          Effect.flatMap(
            Option.match({
              onNone: () => goBack,
              onSome: () => navigate(Route.DeleteModality()),
            }),
          ),
          exec,
        ),
      submit: () =>
        pipe(
          State.with(s => s.modalityForm.id),
          Effect.flatten,
          Effect.flatMap(id =>
            State.with(getModality({ _tag: 'CustomModality', id })),
          ),
          Effect.flatten,
          Effect.bindTo('prevModality'),
          Effect.tap(({ prevModality }) =>
            State.on(root.at('customModalities')).update(
              ReadonlyArray.filter(m => m.id !== prevModality.id),
            ),
          ),
          Effect.bind('nextModality', () =>
            State.with(s =>
              ReadonlyArray.head(s.customModalities).pipe(
                Option.getOrElse(() => soccer),
              ),
            ),
          ),
          Effect.tap(({ nextModality, prevModality }) =>
            State.on(root.at('groups')).update(
              ReadonlyRecord.map(g =>
                g.modality.id === prevModality.id
                  ? {
                      ...g,
                      modality:
                        nextModality._tag === 'CustomModality'
                          ? { _tag: nextModality._tag, id: nextModality.id }
                          : { _tag: nextModality._tag, id: nextModality.id },
                      players: ReadonlyArray.map(
                        g.players,
                        adjustPlayerPosition({
                          prevModality: Option.some(prevModality),
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
          Effect.tap(() => goBack),
          Effect.tap(() => goBack),
          exec,
          Effect.ignore,
        ),
    },
    name: {
      change: flow(State.on(root.at('modalityForm').at('name')).set, exec),
    },
    position: {
      add: () =>
        exec(
          State.on(root.at('modalityForm').at('positions')).update(
            ReadonlyArray.append(blankPositionForm),
          ),
        ),
      remove: (index: number) =>
        exec(
          State.on(root.at('modalityForm').at('positions')).update(
            flow(
              ReadonlyArray.remove(index),
              toNonEmpty,
              Option.getOrElse(() => ReadonlyArray.of(blankPositionForm)),
            ),
          ),
        ),
      lift: (index: number) =>
        exec(
          State.on(root.at('modalityForm').at('positions')).update(as =>
            pipe(
              ReadonlyArray.get(as, index),
              Option.flatMap(a =>
                pipe(
                  ReadonlyArray.remove(as, index),
                  ReadonlyArray.insertAt(index - 1, a),
                ),
              ),
              Option.getOrElse(() => as),
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
                .compose(nonEmptyIndex(args.index))
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
                .compose(nonEmptyIndex(args.index))
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
        Effect.tap(() => importGroupFromDocumentPicker()),
        Effect.ignore,
      ),
    item: {
      open: (id: Id) =>
        pipe(
          navigate(Route.Group()),
          Effect.tap(() =>
            State.on(root.at('ui').at('selectedGroupId')).set(Option.some(id)),
          ),
          exec,
        ),
      upsert: {
        new: () =>
          pipe(
            State.with(s =>
              ReadonlyArray.head(s.customModalities).pipe(
                Option.getOrElse(() => soccer),
              ),
            ),
            Effect.flatMap(m =>
              State.on(root.at('groupForm')).set({
                id: Option.none(),
                name: '',
                modality: m,
              }),
            ),
            Effect.tap(() => navigate(Route.GroupForm())),
            exec,
          ),
        edit: () =>
          pipe(
            State.with(getSelectedGroup),
            Effect.flatten,
            Effect.flatMap(g =>
              State.on(root.at('groupForm')).set({
                id: Option.some(g.id),
                name: g.name,
                modality: g.modality,
              }),
            ),
            Effect.tap(goBack),
            Effect.tap(() => navigate(Route.GroupForm())),
            exec,
            Effect.ignore,
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
            Effect.filterOrElse(
              f => not(String.isEmpty)(f.name),
              () => Option.none(),
            ),
            Effect.flatMap(g =>
              Option.match(g.id, {
                onNone: () => createGroup(g),
                onSome: id => editGroup({ ...g, id }),
              }),
            ),
            Effect.tap(() => goBack),
            exec,
            Effect.ignore,
          ),
      },
    },
  },
  group: {
    menu: {
      open: () => exec(navigate(Route.GroupMenu())),
    },
    sort: {
      open: () => pipe(goBack, Effect.tap(navigate(Route.SortGroup())), exec),
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
          Effect.all([eraseResult, goBack, navigate(Route.Result())]),
          exec,
          Effect.tap(() => Effect.sleep(0)),
          Effect.flatMap(() => generateResult),
        ).pipe(Effect.ignore),
    },
    export: () =>
      pipe(
        goBack,
        exec,
        Effect.tap(() => exportGroup()),
        Effect.ignore,
      ),
    delete: {
      open: () => exec(Effect.all([goBack, navigate(Route.DeleteGroup())])),
      submit: () =>
        pipe(
          State.with(getSelectedGroup),
          Effect.flatten,
          Effect.flatMap(({ id }) => deleteGroup({ id })),
          Effect.tap(goBack),
          Effect.tap(goBack),
          Effect.tap(goBack),
          exec,
          Effect.ignore,
        ),
    },
    player: {
      new: () =>
        pipe(
          navigate(Route.Player()),
          Effect.tap(() =>
            State.on(root.at('ui').at('selectedPlayerId')).set(Option.none()),
          ),
          Effect.flatMap(() =>
            State.with(getActiveModality).pipe(Effect.flatten),
          ),
          Effect.tap(m =>
            State.on(root.at('playerForm')).set(
              blankPlayerForm({ modality: m }),
            ),
          ),
          exec,
        ).pipe(Effect.ignore),
      open: (playerId: Id) =>
        pipe(
          navigate(Route.Player()),
          Effect.flatMap(() =>
            State.with(getPlayerFromSelectedGroup({ playerId })).pipe(
              Effect.flatten,
            ),
          ),
          Effect.flatMap(v =>
            pipe(
              State.on(root.at('playerForm')).set(getPlayerFormFromData(v)),
              Effect.tap(() =>
                State.on(root.at('ui').at('selectedPlayerId')).set(
                  Option.some(playerId),
                ),
              ),
            ),
          ),
          exec,
          Effect.ignore,
        ),
      active: {
        toggle: (id: Id) => exec(togglePlayerActive({ playerId: id })),
        toggleAll: () =>
          pipe(State.update(toggleAllPlayersActive), Effect.tap(goBack), exec),
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
        Schema.decodeUnknownOption(Rating.Rating),
        Option.map(
          flow(State.on(root.at('playerForm').at('rating')).set, exec),
        ),
        Option.getOrElse(() => Effect.unit),
      ),
    },
    delete: () =>
      pipe(
        State.update(deleteCurrentPlayer),
        Effect.tap(() => goBack),
        exec,
      ),
    save: () =>
      pipe(
        Effect.all({
          form: pipe(
            State.on(root.at('playerForm')).get,
            Effect.flatMap(f =>
              pipe(f, Option.liftPredicate(not(() => String.isEmpty(f.name)))),
            ),
          ),
          groupId: Effect.flatten(
            State.on(root.at('ui').at('selectedGroupId')).get,
          ),
          playerId: State.on(root.at('ui').at('selectedPlayerId')).get,
        }),
        Effect.flatMap(({ form, groupId, playerId }) =>
          pipe(
            playerId,
            Option.match({
              onNone: () => createPlayer({ groupId, player: form }),
              onSome: id => editPlayer({ groupId, player: { ...form, id } }),
            }),
            Effect.flatMap(() => goBack),
          ),
        ),
        exec,
        Effect.ignore,
      ),
  },
  result: {
    share: () =>
      pipe(
        Effect.all({
          result: State.with(s => s.result).pipe(Effect.flatten),
          modality: State.with(getActiveModality).pipe(Effect.flatten),
        }),
        StateRef.query,
        Effect.flatMap(({ result, modality }) =>
          pipe(Player.teamListToStringSensitive({ modality })(result), _ =>
            ShareService.shareMessage({ message: _, title: t('Teams') }),
          ),
        ),
        Effect.ignore,
      ),
  },
} satisfies AppEventTree
