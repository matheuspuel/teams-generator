import { NavigatorScreenParams } from '@react-navigation/native'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'
import { theme } from 'src/theme'
import { DrawerNavigator, DrawerParamList } from './Drawer'

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>

export type RootStackParamList = {
  Drawer: NavigatorScreenParams<DrawerParamList>
}

const Stack = createStackNavigator<RootStackParamList>()
export type RootNavigatorObject = typeof Stack

export const RootStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.colors.lightText,
      }}
      initialRouteName="Core/Loading"
    >
      <Stack.Screen
        name="Drawer"
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}
