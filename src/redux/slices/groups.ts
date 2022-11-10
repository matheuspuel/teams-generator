import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { flow, pipe } from 'fp-ts/lib/function'
import { Group } from 'src/datatypes/Group'
import { Player } from 'src/datatypes/Player'
import { RootState } from 'src/redux/store'
import { generateId, Id } from 'src/utils/Entity'
import { A, O, Rec, Tup } from 'src/utils/fp-ts'

type SliceState = Record<Id, Group>

const initialState: SliceState = {}

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

// ACTIONS
