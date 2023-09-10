import { A, F, O, Optic, Record, S, constant, flow, pipe } from 'fp'
import { Group, Player } from 'src/datatypes'
import { RootState } from 'src/model'
import { root } from 'src/model/optic'
import { IdGenerator } from 'src/services/IdGenerator'
import { State } from 'src/services/StateRef'
import { Id } from 'src/utils/Entity'
import { Timestamp } from 'src/utils/datatypes'

export type GroupsState = { [groupId: Id]: Group }
const GroupsState_ = S.record(Id.pipe(S.to), Group.Schema)
export const GroupsState: S.Schema<
  S.From<typeof GroupsState_>,
  GroupsState
> = GroupsState_

export const emptyGroups: GroupsState = {}

const refOnGroups = State.on(root.at('groups'))

export const getGroupsRecord = Optic.get(root.at('groups'))

export const getGroupById = (id: Id) => flow(getGroupsRecord, Record.get(id))

const getPlayer = (args: { groupId: Id; id: Id }) =>
  flow(
    getGroupById(args.groupId),
    O.match_({ onNone: constant([]), onSome: g => g.players }),
    A.findFirst(p => p.id === args.id),
  )

export const getPlayerFromActiveGroup = (args: { playerId: Id }) =>
  pipe(
    State.on(root.at('ui').at('selectedGroupId')).get,
    F.flatten,
    F.flatMap(groupId =>
      State.get.pipe(F.flatMap(getPlayer({ groupId, id: args.playerId }))),
    ),
    F.optionFromOptional,
  )

const addGroup = (group: Group) =>
  refOnGroups.update(gs => ({ ...gs, [group.id]: group }))

export const createGroup = ({ name }: { name: string }) =>
  pipe(
    IdGenerator.generate(),
    F.flatMap(id => addGroup({ id, name, players: [] })),
  )

export const editGroup = (args: { id: Id; name: string }) =>
  refOnGroups.update(s =>
    pipe(
      s,
      Record.modifyOption(args.id, g => ({ ...g, name: args.name })),
      O.getOrElse(() => s),
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
