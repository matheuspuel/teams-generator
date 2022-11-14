import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { constant, flow, pipe } from 'fp-ts/lib/function'
import { Group } from 'src/datatypes/Group'
import { Player } from 'src/datatypes/Player'
import { RootState } from 'src/redux/store'
import { generateId, Id } from 'src/utils/Entity'
import { A, O, Rec, Tup } from 'src/utils/fp-ts'

export type GroupsState = Record<Id, Group>

const initialState: GroupsState = {}

export const groupsSlice = createSlice({
  name: 'groups',
  initialState: initialState,
  reducers: {
    add: {
      reducer: (
        s,
        { payload: p }: PayloadAction<{ id: Id; name: string }>,
      ) => ({
        ...s,
        [p.id]: { id: p.id, name: p.name, players: [] },
      }),
      prepare: (args: { name: string }) => ({
        payload: { id: generateId(), name: args.name },
      }),
    },
    edit: (s, { payload: p }: PayloadAction<{ id: Id; name: string }>) =>
      pipe(
        s,
        Rec.modifyAt(p.id, g => ({ ...g, name: p.name })),
        O.getOrElseW(() => s),
      ),
    delete: (s, { payload: p }: PayloadAction<{ id: Id }>) =>
      pipe(s, Rec.deleteAt(p.id)),
    addPlayer: {
      reducer: (
        s,
        { payload: p }: PayloadAction<{ groupId: Id; player: Player }>,
      ) =>
        pipe(
          s,
          Rec.modifyAt(p.groupId, g => ({
            ...g,
            players: A.append(p.player)(g.players),
          })),
          O.getOrElseW(() => s),
        ),
      prepare: (args: { groupId: Id; player: Omit<Player, 'id'> }) => ({
        payload: {
          ...args,
          player: { ...args.player, id: generateId() },
        },
      }),
    },
    editPlayer: (
      s,
      { payload: p }: PayloadAction<{ groupId: Id; player: Player }>,
    ) =>
      pipe(
        s,
        Rec.modifyAt(p.groupId, g => ({
          ...g,
          players: pipe(
            g.players,
            A.map(a => (a.id === p.player.id ? p.player : a)),
          ),
        })),
        O.getOrElseW(() => s),
      ),
    deletePlayer: (
      s,
      { payload: p }: PayloadAction<{ groupId: Id; playerId: Id }>,
    ) =>
      pipe(
        s,
        Rec.modifyAt(p.groupId, g => ({
          ...g,
          players: pipe(
            g.players,
            A.filter(a => a.id !== p.playerId),
          ),
        })),
        O.getOrElseW(() => s),
      ),
  },
})

export default groupsSlice.reducer

// SELECTORS

export const getGroupsRecord = (s: RootState) => s.groups

export const getGroups = createSelector(
  getGroupsRecord,
  flow(Rec.toEntries, A.map(Tup.snd)),
)

export const getGroupById = (id: Id) => flow(getGroupsRecord, Rec.lookup(id))

export const getPlayer = (args: { groupId: Id; id: Id }) =>
  flow(
    getGroupById(args.groupId),
    O.match(constant([]), g => g.players),
    A.findFirst(p => p.id === args.id),
  )

// ACTIONS
