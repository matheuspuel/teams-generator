import * as SystemUI from 'expo-system-ui'
import * as React from 'react'
import { useColorScheme } from 'react-native'
import { makeTheme, type Theme } from 'src/theme'
import { darkTheme } from 'src/theme/dark'
import { lightTheme } from 'src/theme/light'

export const ThemeContext = React.createContext<{
  light: Theme
  dark: Theme
}>({ light: makeTheme(lightTheme), dark: makeTheme(darkTheme) })

export const useTheme = () => {
  const schema = useColorScheme()
  const themes = React.useContext(ThemeContext)
  return schema === 'dark' ? themes.dark : themes.light
}

export const RootBackgroundStyle = (props: { color: string }) => {
  const theme = useTheme()
  React.useEffect(() => {
    void SystemUI.setBackgroundColorAsync(props.color)
  }, [theme])
  return null
}
