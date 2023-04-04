import { get } from '@fp-ts/optic'
import {
  $,
  $f,
  Apply,
  constVoid,
  D,
  identity,
  none,
  O,
  Optic,
  R,
  ReaderIO,
  Rec,
  RIO,
  RT,
  RTE,
  S,
  some,
  Str,
  T,
  Task,
} from 'fp'
import { not } from 'fp-ts/Predicate'
import { Share } from 'react-native'
import { Player, Rating } from 'src/datatypes'
import { RootState } from 'src/model'
import { root } from 'src/model/Optics'
import { SplashScreen } from 'src/services/SplashScreen'
import { execute, getSApp, replaceSApp } from 'src/services/StateRef'
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
  H extends Record<string, (payload: never) => ReaderIO<never, void>>,
> = {
  [k in keyof H]: Event<k, Parameters<H[k]>[0]>
}[keyof H]

type HandlerEnvFromHandlers<
  H extends Record<string, (payload: never) => ReaderIO<never, void>>,
> = R.EnvType<ReturnType<H[keyof H]>>

export type AppEvent = EventTypeFromHandlers<typeof eventHandlers>

export type HandlerEnv = HandlerEnvFromHandlers<typeof eventHandlers>

const wait =
  (time: Duration): Task<void> =>
  () =>
    new Promise(res => setTimeout(() => res(), time))

const doNothing = RIO.of<unknown, void>(undefined)

const closeParametersModal = replaceSApp(root.ui.modalParameters.$)(false)

export const eventHandlers = {
  doNothing: () => doNothing,
  uiMount: () => SplashScreen.hide,
  goBack: () => execute(goBack),

  openNewGroupModal: () =>
    execute(setUpsertGroupModal(some({ id: O.none, name: '' }))),
  openEditGroupModal: (id: Id) =>
    $(
      S.gets(getGroupById(id)),
      S.chain(
        O.match(
          () => S.modify<RootState>(identity),
          g => setUpsertGroupModal(some({ id: O.some(id), name: g.name })),
        ),
      ),
      execute,
    ),
  closeGroupModal: () => execute(setUpsertGroupModal(none)),
  openDeleteGroupModal: (id: Id) => execute(setDeleteGroupModal(some({ id }))),
  closeDeleteGroupModal: () => execute(setDeleteGroupModal(none)),
  changeGroupName: $f(setUpsertGroupName, execute),
  saveGroup: () =>
    $(
      execute(getSApp(root.ui.modalUpsertGroup.$)),
      RIO.chain(
        $f(
          O.filter(not(m => Str.isEmpty(m.name))),
          O.map(m =>
            $(
              m.id,
              O.matchW(
                () => createGroup({ name: m.name }),
                id => execute(editGroup({ id, name: m.name })),
              ),
              RIO.apFirst(execute(setUpsertGroupModal(O.none))),
            ),
          ),
          O.getOrElseW(() => doNothing),
        ),
      ),
    ),
  deleteGroup: () =>
    $(
      S.gets(Optic.get(root.ui.modalDeleteGroup.$)),
      S.chain(
        O.match(
          () => S.of<RootState, void>(undefined),
          ({ id }) => deleteGroup({ id }),
        ),
      ),
      S.apFirst(setDeleteGroupModal(none)),
      execute,
    ),
  selectGroup: (id: Id) =>
    $(
      navigate('Group'),
      S.chain(() => replaceSApp(root.ui.selectedGroupId.$)(O.some(id))),
      execute,
    ),

  openParametersModal: () =>
    execute(replaceSApp(root.ui.modalParameters.$)(true)),
  closeParametersModal: () => execute(closeParametersModal),
  pressNewPlayer: () =>
    $(
      navigate('Player'),
      S.chain(() =>
        $(
          replaceSApp(root.ui.selectedPlayerId.$)(O.none),
          S.apFirst(replaceSApp(root.playerForm.$)(blankPlayerForm)),
        ),
      ),
      execute,
    ),
  selectPlayer: (playerId: Id) =>
    $(
      navigate('Player'),
      S.chain(() =>
        $(
          getPlayerFromActiveGroup({ playerId }),
          S.chain(
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
  togglePosition: () => execute(togglePosition),
  toggleRating: () => execute(toggleRating),
  shuffle: () =>
    $(
      S.of<RootState, void>(undefined),
      S.chain(() => eraseResult),
      S.chain(() => navigate('Result')),
      S.chain(() => closeParametersModal),
      execute,
      RT.fromReaderIO,
      RT.chainFirstTaskK(() => wait(0)),
      RT.chainReaderIOK(() => generateResult),
    ),

  changePlayerName: $f(replaceSApp(root.playerForm.name.$), execute),
  changePlayerPosition: $f(replaceSApp(root.playerForm.position.$), execute),
  changePlayerRating: $f(
    (v: number) => Math.round(v * 20) / 2,
    D.decodeOption(Rating.Schema),
    O.map($f(replaceSApp(root.playerForm.rating.$), execute)),
    O.getOrElseW(() => RIO.of(undefined)),
  ),
  savePlayer: () =>
    $(
      Apply.sequenceS(S.Apply)({
        form: $(
          S.gets(get(root.playerForm.$)),
          S.map(O.fromPredicate(not(f => Str.isEmpty(f.name)))),
        ),
        groupId: S.gets(get(root.ui.selectedGroupId.$)),
        playerId: $(S.gets(get(root.ui.selectedPlayerId.$)), S.map(O.some)),
      }),
      S.map(Apply.sequenceS(O.Apply)),
      execute,
      RIO.chain(
        O.matchW(
          () => RIO.of(undefined),
          ({ form, groupId, playerId }) =>
            $(
              playerId,
              O.matchW(
                () => createPlayer({ groupId, player: form }),
                id => execute(editPlayer({ groupId, player: { ...form, id } })),
              ),
              RIO.apFirst(execute(goBack)),
            ),
        ),
      ),
      v => v,
    ),
  deletePlayer: () => $(deleteCurrentPlayer, S.apFirst(goBack), execute),

  shareTeamList: () =>
    $(
      execute(S.gets(get(root.result.$))),
      RTE.rightReaderIO,
      RTE.chainTaskK(
        O.match(
          () => T.of(undefined),
          $f(
            Player.TeamListShowSensitive.show,
            t => () => Share.share({ message: t, title: 'Times' }),
            T.map(constVoid),
          ),
        ),
      ),
    ),
} satisfies Record<string, (payload: never) => ReaderIO<never, void>>

export type Event<T, P> = { _tag: 'Event'; event: { _tag: T; payload: P } }

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} = $(eventHandlers, Rec.mapWithIndex(event)) as any

const e2 = {
  doNothing: e.doNothing(),
  uiMount: e.uiMount(),
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

  openParametersModal: e.openParametersModal(),
  closeParametersModal: e.closeParametersModal(),
  pressNewPlayer: e.pressNewPlayer(),
  selectPlayer: e.selectPlayer,
  togglePlayerActive: e.togglePlayerActive,
  toggleAllPlayersActive: e.toggleAllPlayersActive(),
  decrementTeamsCount: e.decrementTeamsCount(),
  incrementTeamsCount: e.incrementTeamsCount(),
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

export const handleEvent = <E extends AppEvent>(
  event: E,
): ReturnType<(typeof eventHandlers)[E['event']['_tag']]> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
  (eventHandlers[event.event._tag] as any)(event.event.payload)

const h = handleEvent

export const on = {
  doNothing: $(e2.doNothing, h),
  uiMount: $(e2.uiMount, h),
  goBack: $(e2.goBack, h),

  openNewGroupModal: $(e2.openNewGroupModal, h),
  openEditGroupModal: $f(e2.openEditGroupModal, h),
  closeGroupModal: $(e2.closeGroupModal, h),
  openDeleteGroupModal: $f(e2.openDeleteGroupModal, h),
  closeDeleteGroupModal: $(e2.closeDeleteGroupModal, h),
  changeGroupName: $f(e2.changeGroupName, h),
  saveGroup: $(e2.saveGroup, h),
  deleteGroup: $(e2.deleteGroup, h),
  selectGroup: $f(e2.selectGroup, h),

  openParametersModal: $(e2.openParametersModal, h),
  closeParametersModal: $(e2.closeParametersModal, h),
  pressNewPlayer: $(e2.pressNewPlayer, h),
  selectPlayer: $f(e2.selectPlayer, h),
  togglePlayerActive: $f(e2.togglePlayerActive, h),
  toggleAllPlayersActive: $(e2.toggleAllPlayersActive, h),
  decrementTeamsCount: $(e2.decrementTeamsCount, h),
  incrementTeamsCount: $(e2.incrementTeamsCount, h),
  togglePosition: $(e2.togglePosition, h),
  toggleRating: $(e2.toggleRating, h),
  shuffle: $(e2.shuffle, h),

  changePlayerName: $f(e2.changePlayerName, h),
  changePlayerPosition: $f(e2.changePlayerPosition, h),
  changePlayerRating: $f(e2.changePlayerRating, h),
  savePlayer: $(e2.savePlayer, h),
  deletePlayer: $(e2.deletePlayer, h),

  shareTeamList: $(e2.shareTeamList, h),
}
