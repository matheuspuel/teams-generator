import { createSelector } from '@reduxjs/toolkit'
import { $, $f, A, apply, constant, O, Rec, RIO, S, Tup } from 'fp'
import { Group } from 'src/datatypes/Group'
import { Player } from 'src/datatypes/Player'
import { generateId, Id } from 'src/utils/Entity'
import { Optic } from 'src/utils/Optic'
import { execute, modifySApp, RootOptic } from '..'

export const GroupsLens = RootOptic.at('groups')

export type GroupsState = Record<Id, Group>

export const emptyGroups: GroupsState = {}

const modify = modifySApp(GroupsLens)

export const getGroupsRecord = Optic.get(GroupsLens)

export const getGroups = createSelector(
  getGroupsRecord,
  $f(Rec.toEntries, A.map(Tup.snd)),
)

export const getGroupById = (id: Id) => $f(getGroupsRecord, Rec.lookup(id))

export const getPlayer = (args: { groupId: Id; id: Id }) =>
  $f(
    getGroupById(args.groupId),
    O.match(constant([]), g => g.players),
    A.findFirst(p => p.id === args.id),
  )

const addGroup = (group: Group) => modify(gs => ({ ...gs, [group.id]: group }))

export const createGroup = ({ name }: { name: string }) =>
  $(
    RIO.fromIO(generateId),
    RIO.chain(id => execute(addGroup({ id, name, players: [] }))),
  )

export const editGroup = (args: { id: Id; name: string }) =>
  modify(s =>
    $(
      s,
      Rec.modifyAt(args.id, g => ({ ...g, name: args.name })),
      O.getOrElseW(() => s),
    ),
  )

export const deleteGroup = (args: { id: Id }) => modify(Rec.deleteAt(args.id))

const addPlayer = (args: { groupId: Id; player: Omit<Player, 'active'> }) =>
  modify(s =>
    $(
      s,
      Rec.modifyAt(args.groupId, g => ({
        ...g,
        players: A.append({ ...args.player, active: true })(g.players),
      })),
      O.getOrElseW(() => s),
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
    RIO.fromIO(generateId),
    RIO.chain(id => execute(addPlayer({ groupId, player: { ...player, id } }))),
  )

export const editPlayer = (p: {
  groupId: Id
  player: Omit<Player, 'active'>
}) =>
  modify(s =>
    $(
      s,
      Rec.modifyAt(p.groupId, g => ({
        ...g,
        players: $(
          g.players,
          A.map(a =>
            a.id === p.player.id ? { ...p.player, active: a.active } : a,
          ),
        ),
      })),
      O.getOrElseW(() => s),
    ),
  )

export const deletePlayer = (p: { groupId: Id; playerId: Id }) =>
  modify(s =>
    $(
      s,
      Rec.modifyAt(p.groupId, g => ({
        ...g,
        players: $(
          g.players,
          A.filter(a => a.id !== p.playerId),
        ),
      })),
      O.getOrElseW(() => s),
    ),
  )

export const togglePlayerActive = (p: { groupId: Id; playerId: Id }) =>
  modify(s =>
    $(
      s,
      Rec.modifyAt(p.groupId, g => ({
        ...g,
        players: $(
          g.players,
          A.map(a => (a.id === p.playerId ? { ...a, active: !a.active } : a)),
        ),
      })),
      O.getOrElseW(() => s),
    ),
  )

export const toggleAllPlayersActive = execute(
  S.modify(s =>
    $(
      s.ui.selectedGroupId,
      O.chain(id => $(s.groups, Rec.lookup(id))),
      O.matchW(
        () => s,
        g =>
          $(
            g.players,
            A.every(p => p.active),
            allActive =>
              $(
                g.players,
                A.map(p => ({ ...p, active: !allActive })),
              ),
            Optic.replace(GroupsLens.key(g.id).at('players')),
            apply(s),
          ),
      ),
    ),
  ),
)
