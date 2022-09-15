import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect } from 'react'

export const Splash = (props: { children: React.ReactElement }) => {
  const [fontsLoaded] = useFonts({
    Tommy_Thin: require('../../../../assets/fonts/MADE_TOMMY_Thin.otf'),
    Tommy_Light: require('../../../../assets/fonts/MADE_TOMMY_Light.otf'),
    Tommy_Regular: require('../../../../assets/fonts/MADE_TOMMY_Regular.otf'),
    Tommy_Medium: require('../../../../assets/fonts/MADE_TOMMY_Medium.otf'),
    Tommy_Bold: require('../../../../assets/fonts/MADE_TOMMY_Bold.otf'),
    Tommy_ExtraBold: require('../../../../assets/fonts/MADE_TOMMY_ExtraBold.otf'),
    Tommy_Black: require('../../../../assets/fonts/MADE_TOMMY_Black.otf'),
  })

  useEffect(() => {
    SplashScreen.preventAutoHideAsync()
  }, [])

  if (!fontsLoaded) {
    return null
  } else {
    return props.children
  }
}
