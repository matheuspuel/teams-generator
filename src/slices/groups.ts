import { A, F, O, Optic, Option, Record, S, flow, pipe } from 'fp'
import { Group, Modality, Player } from 'src/datatypes'
import { RootState } from 'src/model'
import { root } from 'src/model/optic'
import { IdGenerator } from 'src/services/IdGenerator'
import { State } from 'src/services/StateRef'
import { Id } from 'src/utils/Entity'
import { Timestamp } from 'src/utils/datatypes'

export type GroupsState = { [groupId: Id]: Group }
const GroupsState_ = S.record(Id.pipe(S.to), Group.Schema)
export const GroupsState: S.Schema<
  S.Schema.From<typeof GroupsState_>,
  GroupsState
> = GroupsState_

export const emptyGroups: GroupsState = {}

const refOnGroups = State.on(root.at('groups'))

export const getGroupsRecord = Optic.get(root.at('groups'))

export const getGroupById = (id: Id) => flow(getGroupsRecord, Record.get(id))

export const getSelectedGroup = (s: RootState) =>
  pipe(
    s.ui.selectedGroupId,
    O.flatMap(id => getGroupById(id)(s)),
  )

export const getActiveModality = (s: RootState) =>
  pipe(
    getSelectedGroup(s),
    O.flatMap(g => A.findFirst(s.modalities, m => m.id === g.modalityId)),
  )

export const getPlayerFromSelectedGroup =
  (args: { playerId: Id }) => (s: RootState) =>
    pipe(
      getSelectedGroup(s),
      O.map(g => g.players),
      O.flatMap(A.findFirst(p => p.id === args.playerId)),
    )

const addGroup = (group: Group) =>
  refOnGroups.update(gs => ({ ...gs, [group.id]: group }))

export const createGroup = (data: { name: string; modalityId: Id }) =>
  pipe(
    IdGenerator.generate(),
    F.flatMap(id =>
      addGroup({
        id,
        name: data.name,
        modalityId: data.modalityId,
        players: [],
      }),
    ),
  )

export const editGroup = (args: { id: Id; name: string; modalityId: Id }) =>
  pipe(
    F.Do,
    F.bind('prevModality', () =>
      State.with(s =>
        pipe(
          Record.get(s.groups, args.id),
          O.flatMap(prevGroup =>
            A.findFirst(s.modalities, _ => _.id === prevGroup.modalityId),
          ),
        ),
      ),
    ),
    F.bind('nextModality', () =>
      State.with(s =>
        A.findFirst(s.modalities, _ => _.id === args.modalityId),
      ).pipe(F.flatten),
    ),
    F.flatMap(({ prevModality, nextModality }) =>
      refOnGroups.update(s =>
        pipe(
          s,
          Record.modifyOption(args.id, g => ({
            id: g.id,
            name: args.name,
            modalityId: args.modalityId,
            players:
              args.modalityId === g.modalityId
                ? g.players
                : A.map(
                    g.players,
                    adjustPlayerPosition({ prevModality, nextModality }),
                  ),
          })),
          O.getOrElse(() => s),
        ),
      ),
    ),
  )

export const addImportedGroup = (group: Group) =>
  pipe(
    IdGenerator.generate(),
    F.flatMap(id => addGroup({ ...group, id })),
  )

export const deleteGroup = (args: { id: Id }) =>
  refOnGroups.update(Record.remove(args.id))

const addPlayer = (args: { groupId: Id; player: Omit<Player, 'active'> }) =>
  refOnGroups.update(s =>
    pipe(
      s,
      Record.modifyOption(args.groupId, g => ({
        ...g,
        players: A.append({ ...args.player, active: true })(g.players),
      })),
      O.getOrElse(() => s),
    ),
  )

export const createPlayer = ({
  groupId,
  player,
}: {
  groupId: Id
  player: Omit<Player, 'active' | 'id' | 'createdAt'>
}) =>
  pipe(
    F.all({ id: IdGenerator.generate(), time: Timestamp.getNow() }),
    F.flatMap(({ id, time }) =>
      addPlayer({ groupId, player: { ...player, id, createdAt: time } }),
    ),
  )

export const editPlayer = (p: {
  groupId: Id
  player: Omit<Player, 'active' | 'createdAt'>
}) =>
  refOnGroups.update(s =>
    pipe(
      s,
      Record.modifyOption(p.groupId, g => ({
        ...g,
        players: pipe(
          g.players,
          A.map(a =>
            a.id === p.player.id
              ? { ...p.player, active: a.active, createdAt: a.createdAt }
              : a,
          ),
        ),
      })),
      O.getOrElse(() => s),
    ),
  )

export const deleteCurrentPlayer = (s: RootState) =>
  pipe(
    O.all({
      groupId: s.ui.selectedGroupId,
      playerId: s.ui.selectedPlayerId,
    }),
    O.map(({ groupId, playerId }) =>
      Optic.modify(root.at('groups').key(groupId).at('players'))(
        A.filter(p => p.id !== playerId),
      )(s),
    ),
    O.getOrElse(() => s),
  )

export const togglePlayerActive = ({ playerId }: { playerId: Id }) =>
  pipe(
    State.on(root.at('ui').at('selectedGroupId')).get,
    F.flatten,
    F.flatMap(groupId =>
      State.onOption(
        root
          .at('groups')
          .key(groupId)
          .at('players')
          .compose(Optic.findFirst(p => p.id === playerId))
          .at('active'),
      ).update(a => !a),
    ),
    F.ignore,
  )

export const toggleAllPlayersActive = (s: RootState) =>
  pipe(
    s.ui.selectedGroupId,
    O.flatMap(id => pipe(s.groups, Record.get(id))),
    O.match({
      onNone: () => s,
      onSome: g =>
        pipe(
          g.players,
          A.every(p => p.active),
          allActive =>
            pipe(
              g.players,
              A.map(p => ({ ...p, active: !allActive })),
            ),
          Optic.replace(root.at('groups').key(g.id).at('players')),
          f => f(s),
        ),
    }),
  )

export const adjustPlayerPosition =
  (args: { prevModality: Option<Modality>; nextModality: Modality }) =>
  (player: Player) => ({
    ...player,
    positionId: pipe(
      args.prevModality,
      O.map(_ => _.positions),
      O.flatMap(A.findFirst(pos => pos.id === player.positionId)),
      O.flatMap(prevPosition =>
        pipe(
          A.findFirst(
            args.nextModality.positions,
            pos => pos.id === prevPosition.id,
          ),
          O.orElse(() =>
            A.findFirst(
              args.nextModality.positions,
              pos => pos.abbreviation === prevPosition.abbreviation,
            ),
          ),
        ),
      ),
      O.getOrElse(() => args.nextModality.positions[0]),
      _ => _.id,
    ),
  })
