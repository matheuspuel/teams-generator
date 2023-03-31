import {
  $,
  $f,
  Apply,
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
import { Group } from 'src/datatypes/Group'
import { Player } from 'src/datatypes/Player'
import { RootState } from 'src/model'
import { execute, modifySApp } from 'src/services/Store'
import { generateId, Id } from 'src/utils/Entity'
import { RootOptic } from '.'
import { UiLens } from './ui'

export const GroupsLens = RootOptic.at('groups')

export type GroupsState = Record<Id, Group>

export const emptyGroups: GroupsState = {}

const modify = modifySApp(GroupsLens)

export const getGroupsRecord = Optic.get(GroupsLens)

export const getGroupById = (id: Id) => $f(getGroupsRecord, Rec.lookup(id))

const getPlayer = (args: { groupId: Id; id: Id }) =>
  S.gets(
    $f(
      getGroupById(args.groupId),
      O.match(constant([]), g => g.players),
      RA.findFirst(p => p.id === args.id),
    ),
  )

export const getPlayerFromActiveGroup = (args: { playerId: Id }) =>
  $(
    S.gets(get(UiLens.at('selectedGroupId'))),
    S.chain(
      O.match(
        () => S.of<RootState, Option<Player>>(O.none),
        groupId => getPlayer({ groupId, id: args.playerId }),
      ),
    ),
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
        players: RA.append({ ...args.player, active: true })(g.players),
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
          RA.map(a =>
            a.id === p.player.id ? { ...p.player, active: a.active } : a,
          ),
        ),
      })),
      O.getOrElseW(() => s),
    ),
  )

export const deleteCurrentPlayer = S.modify((s: RootState) =>
  $(
    Apply.sequenceS(O.Apply)({
      groupId: s.ui.selectedGroupId,
      playerId: s.ui.selectedPlayerId,
    }),
    O.map(({ groupId, playerId }) =>
      Optic.modify(GroupsLens.key(groupId).at('players'))(
        RA.filter(p => p.id !== playerId),
      )(s),
    ),
    O.getOrElse(() => s),
  ),
)

export const togglePlayerActive = ({ playerId }: { playerId: Id }) =>
  $(
    S.gets(get(UiLens.at('selectedGroupId'))),
    S.chain(
      O.match(
        () => S.modify<RootState>(identity),
        groupId =>
          modifySApp(
            GroupsLens.key(groupId)
              .at('players')
              .compose(Optic.findFirst(p => p.id === playerId))
              .at('active'),
          )(a => !a),
      ),
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
            RA.every(p => p.active),
            allActive =>
              $(
                g.players,
                RA.map(p => ({ ...p, active: !allActive })),
              ),
            Optic.replace(GroupsLens.key(g.id).at('players')),
            apply(s),
          ),
      ),
    ),
  ),
)
