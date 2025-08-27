import { Effect } from 'effect'
import * as SystemUI from 'expo-system-ui'
import * as React from 'react'
import { useColorScheme } from 'react-native'
import { named } from 'src/components/hyperscript'
import { Children, UIColor } from 'src/components/types'
import { Colors, Theme, ThemeImplementation } from 'src/services/Theme'
import { darkTheme } from 'src/services/Theme/dark'
import { lightTheme } from 'src/services/Theme/light'
import { Color } from 'src/utils/datatypes'

export const ThemeContext = React.createContext<{
  light: ThemeImplementation
  dark: ThemeImplementation
}>({ light: lightTheme, dark: darkTheme })

export const ThemeContextProvider = named('ThemeContextProvider')(
  (children: Children) =>
    React.createElement(ThemeContext.Provider, undefined, ...children),
)

export const useTheme = () => {
  const schema = useColorScheme()
  const themes = React.useContext(ThemeContext)
  return schema === 'dark' ? themes.dark : themes.light
}

export const useThemeGetRawColor = () => {
  const theme = useTheme()
  const getColorHex = React.useMemo(
    () => (color: UIColor) =>
      Color.toHex(Effect.runSync(Effect.provideService(color, Theme, theme))),
    [theme],
  )
  return getColorHex
}

export const useAdjustRootColor = () => {
  const getRawColor = useThemeGetRawColor()
  React.useEffect(() => {
    void SystemUI.setBackgroundColorAsync(getRawColor(Colors.background))
  }, [getRawColor])
}
