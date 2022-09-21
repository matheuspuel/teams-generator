import { Button, FlatList, Flex, Pressable, Text } from 'native-base'
import { Alert } from 'react-native'
import { randomizeTeams } from 'src/business/randomize'
import { Player } from 'src/datatypes/Player'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { A, flow, pipe } from 'src/utils/fp-ts'

const playersMock: Player[] = [
  { id: '1', name: 'Matheus', score: 10, position: 'meio-campo' },
  { id: '2', name: 'Paulo A.', score: 4, position: 'atacante' },
  { id: '3', name: 'Carlos', score: 5, position: 'zagueiro' },
  { id: '4', name: 'Paulo G.', score: 8, position: 'goleiro' },
  { id: '5', name: 'Peter', score: 6, position: 'zagueiro' },
  { id: '6', name: 'Zeca', score: 3, position: 'lateral-esquerdo' },
  { id: '7', name: 'Moisés', score: 3, position: 'lateral-direito' },
  { id: '8', name: 'Odilon', score: 9, position: 'meio-campo' },
  { id: '9', name: 'Paulo S.', score: 10, position: 'atacante' },
  { id: '10', name: 'João', score: 7, position: 'meio-campo' },
  { id: '11', name: 'Anderson', score: 3, position: 'zagueiro' },
  { id: '12', name: 'Gilmar', score: 6, position: 'lateral-direito' },
  { id: '13', name: 'Vagner', score: 8, position: 'meio-campo' },
  { id: '14', name: 'Douglas', score: 2, position: 'lateral-direito' },
  { id: '15', name: 'Marlon', score: 4, position: 'atacante' },
  { id: '16', name: 'Marcos', score: 8, position: 'meio-campo' },
  { id: '17', name: 'Jackson', score: 4, position: 'atacante' },
  { id: '18', name: 'Wagner', score: 5, position: 'atacante' },
  { id: '19', name: 'Moa', score: 5, position: 'atacante' },
  { id: '20', name: 'Neto', score: 5, position: 'atacante' },
  { id: '21', name: 'Lucas', score: 7, position: 'zagueiro' },
  { id: '22', name: 'Jevinho', score: 3, position: 'lateral-direito' },
  { id: '23', name: 'Clóvis', score: 7, position: 'zagueiro' },
]

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
          const teams = randomizeTeams(players)()
          const text = pipe(
            teams,
            A.map(
              flow(
                A.map(p => `${p.score} ${p.name} (${p.position}) `),
                v => v.join('\n'),
              ),
            ),
            v => v.join('\n\n'),
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
  const { name, position, score } = props.data

  return (
    <Pressable>
      <Flex bg="white" m="2" p="2" rounded="lg" shadow="1">
        <Text bold>{name}</Text>
        <Text>{position}</Text>
        <Text>{score}</Text>
      </Flex>
    </Pressable>
  )
}
