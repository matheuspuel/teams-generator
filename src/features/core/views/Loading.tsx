import { StatusBar } from 'expo-status-bar'
import { isSome } from 'fp-ts/lib/Option'
import { useEffect } from 'react'
import { getAuthToken } from 'src/features/auth/slices/token'
import { getRealtorData } from 'src/features/realtor/slices/realtor'
import { useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { envName } from 'src/utils/Env'
import { getHydrated } from '../slices/hydrated'

export const Loading = (props: RootStackScreenProps<'Core/Loading'>) => {
  const { navigation } = props
  // const dispatch = useAppDispatch()
  const hydrated = useAppSelector(getHydrated)
  const authenticated = isSome(useAppSelector(getAuthToken))
  const registered = isSome(useAppSelector(getRealtorData))

  useEffect(() => {
    if (!hydrated) return
    if (envName === 'development') {
      // dispatch(setAuthToken(some('token(1)2')))
      // return navigation.replace('Drawer', {
      //   screen: 'Realtor/CreateRealEstate',
      // })
    }
    authenticated
      ? registered
        ? navigation.replace('Drawer', { screen: 'Core/Home' })
        : navigation.replace('Auth/PersonalInfo')
      : navigation.replace('Auth/AuthHome')
  }, [hydrated, authenticated, registered])

  return <StatusBar style="light" />
}
