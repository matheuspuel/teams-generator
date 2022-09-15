import {
  createDrawerNavigator,
  DrawerScreenProps,
} from '@react-navigation/drawer'
import { CompositeScreenProps } from '@react-navigation/native'
import { CustomDrawerContent } from 'src/components/drawer/CustomDrawerContent'
import { CoreDrawerGroupParamList } from 'src/features/core/routes'
import { RealtorDrawerGroupParamList } from 'src/features/realtor/routes'
import { theme } from 'src/theme'
import { RootStackScreenProps } from './RootStack'

export type AppDrawerScreenProps<
  S extends keyof DrawerParamList = keyof DrawerParamList,
> = CompositeScreenProps<
  DrawerScreenProps<DrawerParamList, S>,
  RootStackScreenProps
>

export type DrawerParamList = CoreDrawerGroupParamList &
  RealtorDrawerGroupParamList

const Drawer = createDrawerNavigator<DrawerParamList>()
export type DrawerNavigatorObject = typeof Drawer

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTintColor: theme.colors.lightText,
        drawerStyle: { backgroundColor: theme.colors.white },
        drawerInactiveTintColor: theme.colors.darkText,
        drawerActiveTintColor: theme.colors.primary[600],
        drawerLabelStyle: { fontSize: theme.fontSizes.md },
        swipeEdgeWidth: 80,
      }}
      initialRouteName="Core/Home"
    ></Drawer.Navigator>
  )
}
