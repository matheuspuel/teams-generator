import { Flex, Image } from 'native-base'
import headerLogo from 'src/assets/img/header-logo-blue.png'

export const HeaderLogo = () => {
  return (
    <Flex h="100px" w="full" p="2">
      <Image
        h="full"
        w="full"
        resizeMode="contain"
        alt="Sócio Corretor"
        source={headerLogo}
      />
    </Flex>
  )
}
