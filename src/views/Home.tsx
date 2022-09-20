import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { Flex } from 'native-base'
import { RootStackScreenProps } from 'src/routes/RootStack'

export const Home = (_props: RootStackScreenProps<'Home'>) => {
  return (
    <Flex flex={1} onLayout={() => SplashScreen.hideAsync()}>
      <StatusBar style="light" />
    </Flex>
  )
}
