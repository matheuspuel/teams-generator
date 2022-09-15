import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer'
import { Flex, Image } from 'native-base'
import headerLogo from 'src/assets/img/header-logo-white.png'

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, paddingTop: 0 }}
    >
      <Flex p="6" bg="primary.600" mb="1.5">
        <Flex direction="row" safeArea>
          <Image
            alt="Sócio Corretor"
            source={headerLogo}
            style={{ aspectRatio: 991 / 305 }}
            resizeMode="contain"
          />
        </Flex>
      </Flex>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  )
}
