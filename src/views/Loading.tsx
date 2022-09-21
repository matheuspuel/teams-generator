import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { getHydrated } from 'src/redux/slices/hydrated'
import { useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { envName } from 'src/utils/Env'

export const Loading = (props: RootStackScreenProps<'Loading'>) => {
  const { navigation } = props
  // const dispatch = useAppDispatch()
  const hydrated = useAppSelector(getHydrated)

  useEffect(() => {
    if (!hydrated) return
    if (envName === 'development') {
      // dispatch(setAuthToken(some('token(1)2')))
      // return navigation.replace('Drawer', {
      //   screen: 'Realtor/CreateRealEstate',
      // })
    }
    navigation.replace('Groups')
  }, [hydrated])

  return <StatusBar style="light" />
}
