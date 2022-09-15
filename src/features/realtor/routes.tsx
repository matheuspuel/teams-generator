import { MaterialCommunityIcons } from '@expo/vector-icons'
import { DrawerNavigationOptions } from '@react-navigation/drawer'
import { Icon } from 'native-base'
import { t } from 'src/i18n'
import { DrawerNavigatorObject } from 'src/routes/Drawer'
import { RootNavigatorObject } from 'src/routes/RootStack'
import { CreateRealEstate } from './views/CreateRealEstate'
import { RealEstates } from './views/RealEstates'

export type RealtorDrawerGroupParamList = {
  'Realtor/RealEstates': undefined
  'Realtor/CreateRealEstate': undefined
}

export type RealtorRootStackGroupParamList = Record<string, never>

export const RealtorDrawerRoutes = (props: {
  Navigator: DrawerNavigatorObject
}) => {
  const { Navigator } = props

  return (
    <Navigator.Group>
      <Navigator.Screen
        name="Realtor/RealEstates"
        component={RealEstates}
        options={{
          title: t('real_estates'),
          drawerIcon: drawerIcon(
            <MaterialCommunityIcons name="sign-real-estate" />,
          ),
        }}
      />
      <Navigator.Screen
        name="Realtor/CreateRealEstate"
        component={CreateRealEstate}
        options={{
          title: t('new_real_estate'),
          drawerIcon: drawerIcon(
            <MaterialCommunityIcons name="sign-real-estate" />,
          ),
        }}
      />
    </Navigator.Group>
  )
}

export const RealtorRootStackRoutes = (props: {
  Navigator: RootNavigatorObject
}) => {
  const { Navigator } = props

  return (
    <Navigator.Group screenOptions={{ headerShown: false }}>
      {null}
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
