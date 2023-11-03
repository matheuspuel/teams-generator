import * as SystemUI from 'expo-system-ui'
import * as React from 'react'
import { useColorScheme } from 'react-native'
import { named } from 'src/components/hyperscript'
import { Children, UIColor } from 'src/components/types'
import { AppTheme, AppThemeEnv, Colors } from 'src/services/Theme'
import { darkTheme } from 'src/services/Theme/dark'
import { lightTheme } from 'src/services/Theme/light'
import { Color } from 'src/utils/datatypes'
import { F } from 'src/utils/fp'

export const ThemeContext = React.createContext<{
  light: AppTheme
  dark: AppTheme
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
      Color.toHex(F.runSync(F.provideService(color, AppThemeEnv, theme))),
    [theme],
  )
  return getColorHex
}

export const useAdjustRootColor = () => {
  const getRawColor = useThemeGetRawColor()
  // eslint-disable-next-line functional/no-expression-statements
  React.useEffect(() => {
    // eslint-disable-next-line functional/no-expression-statements
    void SystemUI.setBackgroundColorAsync(getRawColor(Colors.background))
  }, [getRawColor])
}
