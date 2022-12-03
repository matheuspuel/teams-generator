import { StatusBar } from 'expo-status-bar'
import { constVoid } from 'fp-ts/lib/function'
import { useEffect } from 'react'
import { getHydrated } from 'src/redux/slices/hydrated'
import { useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'

export const Loading = (props: RootStackScreenProps<'Loading'>) => {
  const { navigation } = props
  // const dispatch = useAppDispatch()
  const hydrated = useAppSelector(getHydrated)

  useEffect(hydrated ? () => navigation.replace('Groups') : constVoid, [
    hydrated,
  ])

  return <StatusBar style="light" />
}
