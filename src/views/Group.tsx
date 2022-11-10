import { MaterialIcons } from '@expo/vector-icons'
import {
  Button,
  FlatList,
  Flex,
  FormControl,
  Icon,
  Input,
  Modal,
  Pressable,
  Text,
  useDisclose,
} from 'native-base'
import { useLayoutEffect, useState } from 'react'
import { Alert } from 'react-native'
import { generateRandomBalancedTeams } from 'src/business/distribution'
import {
  Player,
  PlayerListShow,
  Rating,
  RatingList,
} from 'src/datatypes/Player'
import { Position, PositionDict } from 'src/datatypes/Position'
import { getGroupById, groupsSlice } from 'src/redux/slices/groups'
import { useAppDispatch, useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { A, Eq, O, pipe, RA, Rec, Tup } from 'src/utils/fp-ts'

export const Group = (props: RootStackScreenProps<'Group'>) => {
  const { navigation, route } = props
  const { id } = route.params
  const dispatch = useAppDispatch()
  const group = useAppSelector(getGroupById(id), O.getEq(Eq.eqStrict).equals)
  const modalAdd = useDisclose()
  const [name, setName] = useState('')
  const [position, setPosition] = useState<Position>('A')
  const [rating, setRating] = useState<Rating>(5)

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
          onPress={modalAdd.onOpen}
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
      <Modal isOpen={modalAdd.isOpen} size="xl">
        <Modal.Content>
          <Modal.Header>
            Novo jogador
            <Modal.CloseButton onPress={modalAdd.onClose} />
          </Modal.Header>
          <Modal.Body>
            <FormControl>
              <FormControl.Label>Nome</FormControl.Label>
              <Input
                placeholder="Ex: Pedro"
                value={name}
                onChangeText={setName}
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>Posição</FormControl.Label>
              <Flex direction="row" justify="space-between">
                {pipe(
                  PositionDict,
                  Rec.toEntries,
                  A.map(Tup.fst),
                  A.map(p => (
                    <Pressable key={p} onPress={() => setPosition(p)}>
                      <Flex
                        justify="center"
                        p="1"
                        size="8"
                        rounded="full"
                        bg={position === p ? 'primary.500' : 'primary.100'}
                      >
                        <Text
                          fontSize="sm"
                          textAlign="center"
                          color="lightText"
                        >
                          {p}
                        </Text>
                      </Flex>
                    </Pressable>
                  )),
                )}
              </Flex>
            </FormControl>
            <FormControl>
              <FormControl.Label>Habilidade</FormControl.Label>
              <Flex direction="row" justify="space-between">
                {pipe(
                  RatingList,
                  RA.map(r => (
                    <Pressable key={r} onPress={() => setRating(r)}>
                      <Flex
                        justify="center"
                        p="1"
                        size="6"
                        rounded="full"
                        bg={rating === r ? 'primary.500' : 'primary.100'}
                      >
                        <Text
                          fontSize="2xs"
                          textAlign="center"
                          color="lightText"
                        >
                          {r}
                        </Text>
                      </Flex>
                    </Pressable>
                  )),
                )}
              </Flex>
            </FormControl>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space="2">
              <Button variant="ghost" onPress={modalAdd.onClose}>
                Cancelar
              </Button>
              <Button
                isDisabled={!name}
                onPress={() => {
                  if (!name) return
                  modalAdd.onClose()
                  dispatch(
                    groupsSlice.actions.addPlayer({
                      groupId: id,
                      player: { name: name, position, rating },
                    }),
                  )
                  setName('')
                  setPosition('A')
                  setRating(5)
                }}
              >
                Gravar
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
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
