import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { theme } from 'src/theme'
import { navigationRef } from './ref'
import { RootStackNavigator } from './RootStack'

const navigationTheme = DefaultTheme
// eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
navigationTheme.colors.card = theme.colors.primary[600]
// eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
navigationTheme.colors.text = theme.colors.lightText
// eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
navigationTheme.colors.primary = theme.colors.primary[900]
// eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
navigationTheme.colors.background = theme.colors.background

const Navigator = () => (
  <NavigationContainer theme={navigationTheme} ref={navigationRef}>
    <RootStackNavigator />
  </NavigationContainer>
)

export default Navigator
