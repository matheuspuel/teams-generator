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

const wait =
  (time: Duration): Task<void> =>
  () =>
    new Promise(res => setTimeout(() => res(), time))

const doNothing = RIO.of<unknown, void>(undefined)

const closeParametersModal = replaceSApp(root.ui.modalParameters.$)(false)

export const on = {
  doNothing,
  uiMount: SplashScreen.hide,
  goBack: execute(goBack),

  openNewGroupModal: execute(
    setUpsertGroupModal(some({ id: O.none, name: '' })),
  ),
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
  closeGroupModal: execute(setUpsertGroupModal(none)),
  openDeleteGroupModal: (id: Id) => execute(setDeleteGroupModal(some({ id }))),
  closeDeleteGroupModal: execute(setDeleteGroupModal(none)),
  changeGroupName: $f(setUpsertGroupName, execute),
  saveGroup: $(
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
  deleteGroup: $(
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

  openParametersModal: execute(replaceSApp(root.ui.modalParameters.$)(true)),
  closeParametersModal: execute(closeParametersModal),
  pressNewPlayer: $(
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
  toggleAllPlayersActive: execute(toggleAllPlayersActive),
  decrementTeamsCount: execute(decrementTeamsCount),
  incrementTeamsCount: execute(incrementTeamsCount),
  togglePosition: execute(togglePosition),
  toggleRating: execute(toggleRating),
  shuffle: $(
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
  savePlayer: $(
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
  ),
  deletePlayer: $(deleteCurrentPlayer, S.apFirst(goBack), execute),

  shareTeamList: $(
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
}
