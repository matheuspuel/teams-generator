import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'
import { constant, pipe } from 'fp-ts/lib/function'
import { none, Option, some } from 'fp-ts/lib/Option'
import { api } from 'src/redux/api'
import { RootState } from 'src/redux/store'
import { E } from 'src/utils/fp-ts'

export type AuthToken = string

const authTokenSlice = createSlice({
  name: 'token',
  initialState: none as Option<AuthToken>,
  reducers: {
    set: (s, a: PayloadAction<Option<AuthToken>>) => a.payload,
  },
  extraReducers: builder => {
    builder
      .addMatcher(api.endpoints.smsLogin.matchFulfilled, (s, a) =>
        pipe(
          a.payload,
          E.match(constant(s), v => some(v.token)),
        ),
      )
      .addMatcher(
        isAnyOf(
          api.endpoints.logoff.matchFulfilled,
          api.endpoints.logoff.matchRejected,
        ),
        constant(none),
      )
  },
})

export default authTokenSlice.reducer

// SELECTORS

export const getAuthToken = (state: RootState) => state.auth.token

// ACTIONS

export const setAuthToken = authTokenSlice.actions.set
