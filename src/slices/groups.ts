import {
  $,
  $f,
  A,
  apply,
  constant,
  get,
  identity,
  O,
  Optic,
  Option,
  RA,
  Rec,
  RIO,
  S,
} from 'fp'
import { Group, Player } from 'src/datatypes'
import { RootState } from 'src/model'
import { root } from 'src/model/Optics'
import { IdGenerator } from 'src/services/IdGenerator'
import { execute, modifySApp } from 'src/services/StateRef'
import { Id } from 'src/utils/Entity'

export type GroupsState = Record<Id, Group>

export const emptyGroups: GroupsState = {}

const modify = modifySApp(root.groups.$)

export const getGroupsRecord = Optic.get(root.groups.$)

export const getGroupById = (id: Id) => $f(getGroupsRecord, Rec.get(id))

const getPlayer = (args: { groupId: Id; id: Id }) =>
  S.gets(
    $f(
      getGroupById(args.groupId),
      O.match_(constant([]), g => g.players),
      A.findFirst(p => p.id === args.id),
    ),
  )

export const getPlayerFromActiveGroup = (args: { playerId: Id }) =>
  $(
    S.gets(get(root.ui.selectedGroupId.$)),
    S.chain(
      O.match(
        () => S.of<RootState, Option<Player>>(O.none()),
        groupId => getPlayer({ groupId, id: args.playerId }),
      ),
    ),
  )

const addGroup = (group: Group) => modify(gs => ({ ...gs, [group.id]: group }))

export const createGroup = ({ name }: { name: string }) =>
  $(
    IdGenerator.generate,
    RIO.chainW(id => execute(addGroup({ id, name, players: [] }))),
  )

export const editGroup = (args: { id: Id; name: string }) =>
  modify(s =>
    $(
      s,
      Rec.modifyOption(args.id, g => ({ ...g, name: args.name })),
      O.getOrElse(() => s),
    ),
  )

export const deleteGroup = (args: { id: Id }) => modify(Rec.remove(args.id))

const addPlayer = (args: { groupId: Id; player: Omit<Player, 'active'> }) =>
  modify(s =>
    $(
      s,
      Rec.modifyOption(args.groupId, g => ({
        ...g,
        players: RA.append({ ...args.player, active: true })(g.players),
      })),
      O.getOrElse(() => s),
    ),
  )

export const createPlayer = ({
  groupId,
  player,
}: {
  groupId: Id
  player: Omit<Player, 'active' | 'id'>
}) =>
  $(
    IdGenerator.generate,
    RIO.chainW(id =>
      execute(addPlayer({ groupId, player: { ...player, id } })),
    ),
  )

export const editPlayer = (p: {
  groupId: Id
  player: Omit<Player, 'active'>
}) =>
  modify(s =>
    $(
      s,
      Rec.modifyOption(p.groupId, g => ({
        ...g,
        players: $(
          g.players,
          RA.map(a =>
            a.id === p.player.id ? { ...p.player, active: a.active } : a,
          ),
        ),
      })),
      O.getOrElse(() => s),
    ),
  )

export const deleteCurrentPlayer = S.modify((s: RootState) =>
  $(
    O.struct({
      groupId: s.ui.selectedGroupId,
      playerId: s.ui.selectedPlayerId,
    }),
    O.map(({ groupId, playerId }) =>
      Optic.modify(root.groups.id(groupId).players.$)(
        RA.filter(p => p.id !== playerId),
      )(s),
    ),
    O.getOrElse(() => s),
  ),
)

export const togglePlayerActive = ({ playerId }: { playerId: Id }) =>
  $(
    S.gets(get(root.ui.selectedGroupId.$)),
    S.chain(
      O.match(
        () => S.modify<RootState>(identity),
        groupId =>
          modifySApp(root.groups.id(groupId).players.id(playerId).active.$)(
            a => !a,
          ),
      ),
    ),
  )

export const toggleAllPlayersActive = S.modify((s: RootState) =>
  $(
    s.ui.selectedGroupId,
    O.flatMap(id => $(s.groups, Rec.get(id))),
    O.match(
      () => s,
      g =>
        $(
          g.players,
          RA.every(p => p.active),
          allActive =>
            $(
              g.players,
              RA.map(p => ({ ...p, active: !allActive })),
            ),
          Optic.replace(root.groups.id(g.id).players.$),
          apply(s),
        ),
    ),
  ),
)
