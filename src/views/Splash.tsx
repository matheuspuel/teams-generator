import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect } from 'react'
import { getHydrated } from 'src/redux/slices/hydrated'
import { useAppSelector } from 'src/redux/store'

export const Splash = (props: { children: React.ReactElement }) => {
  const ready = useAppSelector(getHydrated)

  useEffect(() => void SplashScreen.preventAutoHideAsync(), [])

  return ready ? props.children : null
}
