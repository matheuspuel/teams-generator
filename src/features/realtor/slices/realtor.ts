import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'
import { constant, pipe } from 'fp-ts/lib/function'
import { none, Option, some } from 'fp-ts/lib/Option'
import { api } from 'src/redux/api'
import { RootState } from 'src/redux/store'
import { E } from 'src/utils/fp-ts'

export type RealtorData = {
  name: string
  websiteSlug: Option<string>
  contacts: { phones: Array<string>; emails: Array<string> }
}

const realtorSlice = createSlice({
  name: 'realtor',
  initialState: none as Option<RealtorData>,
  reducers: {
    set: (s, a: PayloadAction<Option<RealtorData>>) => a.payload,
  },
  extraReducers: builder =>
    builder
      .addMatcher(
        isAnyOf(
          api.endpoints.realtorInfo.matchFulfilled,
          api.endpoints.register.matchFulfilled,
        ),
        (s, a) => pipe(a.payload, E.match(constant(s), some)),
      )
      .addMatcher(api.endpoints.logoff.matchPending, constant(none)),
})

export default realtorSlice.reducer

// SELECTORS

export const getRealtorData = (state: RootState) => state.realtor.realtor

// ACTIONS

export const setRealtorData = realtorSlice.actions.set
