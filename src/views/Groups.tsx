import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { FlatList, Flex, Pressable, Text } from 'native-base'
import { Group } from 'src/datatypes/Group'
import { RootStackScreenProps } from 'src/routes/RootStack'

const groupsMock: Group[] = [
  { id: '1', name: 'Futsal de segunda' },
  { id: '2', name: 'Jogo de terça-feira' },
  { id: '3', name: 'Turma da quinta' },
]

export const Groups = (props: RootStackScreenProps<'Groups'>) => {
  const groups: Group[] = groupsMock

  return (
    <Flex flex={1} onLayout={() => SplashScreen.hideAsync()}>
      <StatusBar style="light" />
      <FlatList
        data={groups}
        renderItem={({ item }) => <Item data={item} parentProps={props} />}
      />
    </Flex>
  )
}

const Item = (props: {
  data: Group
  parentProps: RootStackScreenProps<'Groups'>
}) => {
  const { name, id } = props.data
  const { navigation } = props.parentProps

  return (
    <Pressable onPress={() => navigation.navigate('Group', { id })}>
      <Flex bg="white" m="2" p="2" rounded="lg" shadow="1">
        <Text bold>{name}</Text>
      </Flex>
    </Pressable>
  )
}
