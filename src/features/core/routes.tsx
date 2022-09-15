import { MaterialIcons } from '@expo/vector-icons'
import { DrawerNavigationOptions } from '@react-navigation/drawer'
import { Icon } from 'native-base'
import { t } from 'src/i18n'
import { DrawerNavigatorObject } from 'src/routes/Drawer'
import { RootNavigatorObject } from 'src/routes/RootStack'
import { Home } from './views/Home'
import { Loading } from './views/Loading'
import { NotImplemented } from './views/NotImplemented'

export type CoreDrawerGroupParamList = {
  'Core/Home': undefined
  'Core/Settings': undefined
}

export type CoreRootStackGroupParamList = {
  'Core/Loading': undefined
}

export const CoreDrawerRoutes = (props: {
  Navigator: DrawerNavigatorObject
}) => {
  const { Navigator } = props

  return (
    <Navigator.Group>
      <Navigator.Screen //
        name="Core/Home"
        component={Home}
        options={{
          title: t('home'),
          drawerIcon: drawerIcon(<MaterialIcons name="home" />),
        }}
      />
      <Navigator.Screen //
        name="Core/Settings"
        component={NotImplemented}
        options={{
          title: t('settings'),
          drawerIcon: drawerIcon(<MaterialIcons name="settings" />),
        }}
      />
    </Navigator.Group>
  )
}

export const CoreRootStackRoutes = (props: {
  Navigator: RootNavigatorObject
}) => {
  const { Navigator } = props

  return (
    <Navigator.Group screenOptions={{ headerShown: false }}>
      <Navigator.Screen //
        name="Core/Loading"
        component={Loading}
      />
    </Navigator.Group>
  )
}

const drawerIcon = (as: unknown): DrawerNavigationOptions['drawerIcon'] =>
  function DrawerIcon({ focused }) {
    return (
      <Icon
        mr="-20px"
        color={focused ? 'primary.500' : 'gray.500'}
        size="lg"
        as={as}
      />
    )
  }
