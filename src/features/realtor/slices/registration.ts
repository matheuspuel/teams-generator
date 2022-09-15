import { PhoneNumber } from '@common/src/datatypes/String'
import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'
import { constant, pipe } from 'fp-ts/lib/function'
import { api } from 'src/redux/api'
import { RootState } from 'src/redux/store'
import { E } from 'src/utils/fp-ts'

export type RegistrationData = {
  phoneNumber: PhoneNumber
  agencyName: string
  name: string
  email: string
  creci: string
}

const registrationSlice = createSlice({
  name: 'registration',
  initialState: {} as Partial<RegistrationData>,
  reducers: {
    merge: (s, a: PayloadAction<Partial<RegistrationData>>) => ({
      ...s,
      ...a.payload,
    }),
  },
  extraReducers: builder =>
    builder.addMatcher(
      isAnyOf(
        api.endpoints.realtorInfo.matchFulfilled,
        api.endpoints.register.matchFulfilled,
      ),
      (s, a) => pipe(a.payload, E.match(constant(s), constant({}))),
    ),
})

export default registrationSlice.reducer

// SELECTORS

export const getRegistrationData = (state: RootState) =>
  state.realtor.registration

// ACTIONS

export const mergeRegistrationData = registrationSlice.actions.merge
