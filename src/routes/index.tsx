import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { theme } from 'src/theme'
import { navigationRef } from './ref'
import { RootStackNavigator } from './RootStack'

const navigationTheme = DefaultTheme
navigationTheme.colors.card = theme.colors.primary[600]
navigationTheme.colors.text = theme.colors.lightText
navigationTheme.colors.primary = theme.colors.primary[900]
navigationTheme.colors.background = theme.colors.background

const Navigator = () => (
  <NavigationContainer theme={navigationTheme} ref={navigationRef}>
    <RootStackNavigator />
  </NavigationContainer>
)

export default Navigator

// const navigate: typeof navigationRef['navigate'] = (...args) => {
//   if (navigationRef.isReady()) {
//     navigationRef.navigate(...(args as any))
//   }
// }

// const popToTop = () => {
//   if (navigationRef.isReady()) {
//     if (navigationRef.canGoBack()) {
//       navigationRef.dispatch(StackActions.popToTop())
//     }
//   }
// }

// const replace: RootStackScreenProps['navigation']['replace'] = (...args) => {
//   if (navigationRef.isReady()) {
//     navigationRef.dispatch(StackActions.replace(...(args as [any, any])))
//   }
// }

// export const RootNavigation = { navigate, popToTop, replace }
