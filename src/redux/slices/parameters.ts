import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { defaultParameters, Parameters } from 'src/datatypes/Parameters'
import { RootState } from 'src/redux/store'
import { Num, Ord } from 'src/utils/fp-ts'

const initialState: Parameters = defaultParameters

const teamsCountClamp = Ord.clamp(Num.Ord)(2, 8)

export const parametersSlice = createSlice({
  name: 'parameters',
  initialState: initialState,
  reducers: {
    setPosition: (s, { payload: p }: PayloadAction<boolean>) => ({
      ...s,
      position: p,
    }),
    setRating: (s, { payload: p }: PayloadAction<boolean>) => ({
      ...s,
      rating: p,
    }),
    incrementTeamsCount: s => ({
      ...s,
      teamsCount: teamsCountClamp(s.teamsCount + 1),
    }),
    decrementTeamsCount: s => ({
      ...s,
      teamsCount: teamsCountClamp(s.teamsCount - 1),
    }),
  },
})

export default parametersSlice.reducer

// SELECTORS

export const getParameters = (s: RootState) => s.parameters

// ACTIONS
