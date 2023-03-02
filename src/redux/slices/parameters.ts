import { createSlice } from '@reduxjs/toolkit'
import { Num, Ord } from 'fp'
import { defaultParameters, Parameters } from 'src/datatypes/Parameters'
import { RootState } from 'src/redux/store'

const initialState: Parameters = defaultParameters

const teamsCountClamp = Ord.clamp(Num.Ord)(2, 8)

export const parametersSlice = createSlice({
  name: 'parameters',
  initialState: initialState,
  reducers: {
    togglePosition: s => ({ ...s, position: !s.position }),
    toggleRating: s => ({ ...s, rating: !s.rating }),
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
