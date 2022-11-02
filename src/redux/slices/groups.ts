import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Group } from 'src/datatypes/Group'
import { RootState } from 'src/redux/store'
import { generateId, Id } from 'src/utils/Entity'

export const groupsSlice = createSlice({
  name: 'groups',
  initialState: [] as Group[],
  reducers: {
    set: (s, a: PayloadAction<Group[]>) => a.payload,
    add: {
      reducer: (s, { payload: p }: PayloadAction<{ id: Id; name: string }>) => [
        ...s,
        { id: p.id, name: p.name, players: [] },
      ],
      prepare: (args: { name: string }) => ({
        payload: { id: generateId(), name: args.name },
      }),
    },
  },
})

export default groupsSlice.reducer

// SELECTORS

export const getGroups = (s: RootState) => s.groups

// ACTIONS
