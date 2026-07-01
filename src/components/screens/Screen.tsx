import * as React from 'react'
import { Screen as RNSScreen_ } from 'react-native-screens'
import { useThemeGetRawColor } from 'src/contexts/Theme'
import { Colors } from 'src/services/Theme'

export const Screen = ({ children }: { children: React.ReactNode }) => {
  const getRawColor = useThemeGetRawColor()
  return (
    <RNSScreen_
      children={children}
      stackAnimation="none"
      style={{ backgroundColor: getRawColor(Colors.background) }}
    />
  )
}
