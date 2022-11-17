import { MaterialIcons } from '@expo/vector-icons'
import { Button, FlatList, Flex, Icon, Pressable, Text } from 'native-base'
import { useLayoutEffect } from 'react'
import { Alert } from 'react-native'
import { generateRandomBalancedTeams } from 'src/business/distribution'
import { Player, PlayerListShow } from 'src/datatypes/Player'
import { getGroupById } from 'src/redux/slices/groups'
import { useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { A, Eq, none, O, pipe, some } from 'src/utils/fp-ts'

export const Group = (props: RootStackScreenProps<'Group'>) => {
  const { navigation, route } = props
  const { id } = route.params
  const group = useAppSelector(getGroupById(id), O.getEq(Eq.eqStrict).equals)

  const players: Player[] = pipe(
    group,
    O.map(g => g.players),
    O.getOrElseW(() => []),
  )

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }) => (
        <Pressable
          mr="1"
          p="2"
          rounded="full"
          _pressed={{ bg: 'primary.700' }}
          onPress={() => {
            navigation.navigate('Player', { groupId: id, id: none })
          }}
        >
          <Icon size="lg" color={tintColor} as={<MaterialIcons name="add" />} />
        </Pressable>
      ),
    })
  }, [])

  return (
    <Flex flex={1}>
      <FlatList
        data={players}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => <Item data={item} parentProps={props} />}
      />
      <Button
        rounded="none"
        onPress={() => {
          const teams = generateRandomBalancedTeams({
            position: true,
            rating: true,
          })(2)(players)()
          const text = pipe(teams, A.map(PlayerListShow.show), v =>
            v.join('\n\n'),
          )
          Alert.alert('Resultado', text)
        }}
      >
        Sortear
      </Button>
    </Flex>
  )
}

const Item = (props: {
  data: Player
  parentProps: RootStackScreenProps<'Group'>
}) => {
  const { navigation, route } = props.parentProps
  const { id: groupId } = route.params
  const { id, name, position, rating } = props.data

  return (
    <Pressable
      onPress={() => {
        navigation.navigate('Player', { groupId, id: some(id) })
      }}
    >
      <Flex
        direction="row"
        align="center"
        bg="white"
        m="1"
        p="1"
        rounded="lg"
        shadow="1"
      >
        <Flex
          alignSelf="stretch"
          justify="center"
          align="center"
          p="1"
          style={{ aspectRatio: 1 }}
          rounded="full"
          bg="amber.300"
        >
          <Text bold>{position}</Text>
        </Flex>
        <Text p="1" bold>
          {rating}
        </Text>
        <Text isTruncated>{name}</Text>
      </Flex>
    </Pressable>
  )
}
