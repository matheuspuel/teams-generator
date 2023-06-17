import { get } from '@fp-ts/optic'
import {
  $,
  $f,
  Apply,
  D,
  Eff,
  Effect,
  O,
  Optic,
  S,
  Str,
  constant,
  identity,
  none,
  not,
  some,
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
import { Id } from 'src/utils/Entity'
import { Duration } from 'src/utils/datatypes'
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
const ignore = noArg(Eff.unit())

const wait = (time: Duration): Effect<never, never, void> =>
  Eff.promise(() => new Promise(res => setTimeout(() => res(), time)))

const closeParametersModal = replaceSApp(root.ui.modalParameters.$)(false)

export const appEventsDefinition = defineEvents({
  doNothing: ignore,
  back: (_: void) =>
    $(
      execute(goBack),
      Eff.tap(({ shouldBubbleUpEvent }) =>
        shouldBubbleUpEvent ? BackHandler.exit : Eff.unit(),
      ),
    ),
  core: {
    preventSplashScreenAutoHide: (_: void) => SplashScreen.preventAutoHide,
    uiMount: (_: void) => SplashScreen.hide,
    appLoaded: (_: void) => execute(replaceSApp(root.core.loaded.$)(true)),
    saveState: (_: void) => saveState,
  },
  groups: {
    item: {
      open: (id: Id) =>
        $(
          navigate('Group'),
          S.flatMap(() => replaceSApp(root.ui.selectedGroupId.$)(O.some(id))),
          execute,
        ),
      upsert: {
        new: (_: void) =>
          execute(setUpsertGroupModal(some({ id: O.none(), name: '' }))),
        edit: (id: Id) =>
          $(
            S.gets(getGroupById(id)),
            S.flatMap(
              O.match(
                () => S.modify<RootState>(identity),
                g =>
                  setUpsertGroupModal(some({ id: O.some(id), name: g.name })),
              ),
            ),
            execute,
          ),
        close: (_: void) => execute(setUpsertGroupModal(none())),
        form: { name: { change: $f(setUpsertGroupName, execute) } },
        submit: (_: void) =>
          $(
            getSApp(root.ui.modalUpsertGroup.$),
            S.map(O.filter(m => $(m.name, not(Str.isEmpty)))),
            execute,
            Eff.flatMap(
              O.match(
                () => ignore(),
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
      },
      delete: {
        open: (id: Id) => execute(setDeleteGroupModal(some({ id }))),
        close: (_: void) => execute(setDeleteGroupModal(none())),
        submit: (_: void) =>
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
      },
    },
  },
  group: {
    sort: {
      open: (_: void) =>
        execute(replaceSApp(root.ui.modalSortGroup.$)(O.some(null))),
      close: (_: void) =>
        execute(replaceSApp(root.ui.modalSortGroup.$)(O.none())),
      by: {
        name: (_: void) => $(onSelectGroupOrder('name'), execute),
        position: (_: void) => $(onSelectGroupOrder('position'), execute),
        rating: (_: void) => $(onSelectGroupOrder('rating'), execute),
        active: (_: void) => $(onSelectGroupOrder('active'), execute),
        date: (_: void) => $(onSelectGroupOrder('date'), execute),
      },
    },
    parameters: {
      open: (_: void) => execute(replaceSApp(root.ui.modalParameters.$)(true)),
      close: (_: void) => execute(closeParametersModal),
      teamsCount: {
        decrement: (_: void) => execute(decrementTeamsCount),
        increment: (_: void) => execute(incrementTeamsCount),
        toggleType: (_: void) =>
          $(modifySApp(root.parameters.$)(Parameters_.toggleType), execute),
      },
      position: { toggle: (_: void) => execute(togglePosition) },
      rating: { toggle: (_: void) => execute(toggleRating) },
      shuffle: (_: void) =>
        $(
          S.of<RootState, void>(undefined),
          S.flatMap(() => eraseResult),
          S.flatMap(() => navigate('Result')),
          S.flatMap(() => closeParametersModal),
          execute,
          Eff.tap(() => wait(0)),
          Eff.flatMap(() => generateResult),
        ),
    },
    player: {
      new: (_: void) =>
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
      open: (playerId: Id) =>
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
      active: {
        toggle: (id: Id) => execute(togglePlayerActive({ playerId: id })),
        toggleAll: (_: void) => execute(toggleAllPlayersActive),
      },
    },
  },
  player: {
    name: { change: $f(replaceSApp(root.playerForm.name.$), execute) },
    position: { change: $f(replaceSApp(root.playerForm.position.$), execute) },
    rating: {
      change: $f(
        (v: number) => Math.round(v * 20) / 2,
        D.parseOption(Rating.Schema),
        v => v,
        O.map($f(replaceSApp(root.playerForm.rating.$), execute)),
        O.getOrElse(() => Eff.unit()),
      ),
    },
    delete: (_: void) => $(deleteCurrentPlayer, S.apFirst(goBack), execute),
    save: (_: void) =>
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
                  id =>
                    execute(editPlayer({ groupId, player: { ...form, id } })),
                ),
                Eff.flatMap(() => execute(goBack)),
              ),
          ),
        ),
        v => v,
      ),
  },
  result: {
    share: (_: void) =>
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
  },
})

export const appEvents = makeEventConstructors(appEventsDefinition)<AppEvent>()
