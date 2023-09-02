import {
  $,
  $f,
  A,
  D,
  F,
  O,
  Optic,
  Option,
  Rec,
  S,
  constant,
  get,
  identity,
  pipe,
} from 'fp'
import { Group, Player } from 'src/datatypes'
import { RootState } from 'src/model'
import { root } from 'src/model/optic'
import { IdGenerator } from 'src/services/IdGenerator'
import { execute, modifySApp } from 'src/services/StateRef'
import { Id } from 'src/utils/Entity'
import { Timestamp } from 'src/utils/datatypes'

export type GroupsState = { [groupId: Id]: Group }
const GroupsState_ = D.record(Id.pipe(D.to), Group.Schema)
export const GroupsState: D.Schema<
  D.From<typeof GroupsState_>,
  GroupsState
> = GroupsState_

export const emptyGroups: GroupsState = {}

const modify = modifySApp(root.at('groups'))

export const getGroupsRecord = Optic.get(root.at('groups'))

export const getGroupById = (id: Id) => $f(getGroupsRecord, Rec.get(id))

const getPlayer = (args: { groupId: Id; id: Id }) =>
  S.gets(
    $f(
      getGroupById(args.groupId),
      O.match_({ onNone: constant([]), onSome: g => g.players }),
      A.findFirst(p => p.id === args.id),
    ),
  )

export const getPlayerFromActiveGroup = (args: { playerId: Id }) =>
  $(
    S.gets(get(root.at('ui').at('selectedGroupId'))),
    S.chain(
      O.match({
        onNone: () => S.of<RootState, Option<Player>>(O.none()),
        onSome: groupId => getPlayer({ groupId, id: args.playerId }),
      }),
    ),
  )

const addGroup = (group: Group) => modify(gs => ({ ...gs, [group.id]: group }))

export const createGroup = ({ name }: { name: string }) =>
  $(
    IdGenerator.generate(),
    F.flatMap(id => execute(addGroup({ id, name, players: [] }))),
  )

export const editGroup = (args: { id: Id; name: string }) =>
  modify(s =>
    $(
      s,
      Rec.modifyOption(args.id, g => ({ ...g, name: args.name })),
      O.getOrElse(() => s),
    ),
  )

export const addImportedGroup = (group: Group) =>
  pipe(
    IdGenerator.generate(),
    F.flatMap(id => execute(addGroup({ ...group, id }))),
  )

export const deleteGroup = (args: { id: Id }) => modify(Rec.remove(args.id))

const addPlayer = (args: { groupId: Id; player: Omit<Player, 'active'> }) =>
  modify(s =>
    $(
      s,
      Rec.modifyOption(args.groupId, g => ({
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
  $(
    F.all({ id: IdGenerator.generate(), time: Timestamp.getNow() }),
    F.flatMap(({ id, time }) =>
      execute(
        addPlayer({ groupId, player: { ...player, id, createdAt: time } }),
      ),
    ),
  )

export const editPlayer = (p: {
  groupId: Id
  player: Omit<Player, 'active' | 'createdAt'>
}) =>
  modify(s =>
    $(
      s,
      Rec.modifyOption(p.groupId, g => ({
        ...g,
        players: $(
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

export const deleteCurrentPlayer = S.modify((s: RootState) =>
  $(
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
  ),
)

export const togglePlayerActive = ({ playerId }: { playerId: Id }) =>
  $(
    S.gets(get(root.at('ui').at('selectedGroupId'))),
    S.chain(
      O.match({
        onNone: () => S.modify<RootState>(identity),
        onSome: groupId =>
          modifySApp(
            root
              .at('groups')
              .key(groupId)
              .at('players')
              .compose(Optic.findFirst(p => p.id === playerId))
              .at('active'),
          )(a => !a),
      }),
    ),
  )

export const toggleAllPlayersActive = S.modify((s: RootState) =>
  $(
    s.ui.selectedGroupId,
    O.flatMap(id => $(s.groups, Rec.get(id))),
    O.match({
      onNone: () => s,
      onSome: g =>
        $(
          g.players,
          A.every(p => p.active),
          allActive =>
            $(
              g.players,
              A.map(p => ({ ...p, active: !allActive })),
            ),
          Optic.replace(root.at('groups').key(g.id).at('players')),
          f => f(s),
        ),
    }),
  ),
)
