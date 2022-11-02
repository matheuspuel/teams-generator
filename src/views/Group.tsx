import { Button, FlatList, Flex, Pressable, Text } from 'native-base'
import { Alert } from 'react-native'
import { generateRandomBalancedTeams } from 'src/business/distribution'
import { Player, PlayerListShow } from 'src/datatypes/Player'
import { playersMock } from 'src/mocks/Player'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { A, pipe } from 'src/utils/fp-ts'

export const Group = (props: RootStackScreenProps<'Group'>) => {
  const players: Player[] = playersMock

  return (
    <Flex flex={1}>
      <FlatList
        data={players}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => <Item data={item} parentProps={props} />}
      />
      <Button
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
  const { name, position, rating } = props.data

  return (
    <Pressable>
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
          justify="center"
          align="center"
          p="1"
          size="8"
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
