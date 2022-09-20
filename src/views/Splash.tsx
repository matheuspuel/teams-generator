import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect } from 'react'

export const Splash = (props: { children: React.ReactElement }) => {
  useEffect(() => {
    SplashScreen.preventAutoHideAsync()
  }, [])

  const ready = true
  if (!ready) {
    return null
  } else {
    return props.children
  }
}
