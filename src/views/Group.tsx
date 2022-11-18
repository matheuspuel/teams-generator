import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import {
  Button,
  Checkbox,
  FlatList,
  Flex,
  Icon,
  Pressable,
  Text,
} from 'native-base'
import { useLayoutEffect } from 'react'
import { Player, PlayerIsActive } from 'src/datatypes/Player'
import { getGroupById, groupsSlice } from 'src/redux/slices/groups'
import { useAppDispatch, useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { A, Eq, none, O, pipe, some } from 'src/utils/fp-ts'

export const Group = (props: RootStackScreenProps<'Group'>) => {
  const { navigation, route } = props
  const { id } = route.params
  const dispatch = useAppDispatch()
  const group = useAppSelector(getGroupById(id), O.getEq(Eq.eqStrict).equals)

  const players: Player[] = pipe(
    group,
    O.map(g => g.players),
    O.getOrElseW(() => []),
  )

  const allActive = pipe(players, A.every(PlayerIsActive))

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }) => (
        <Flex direction="row">
          <Pressable
            mr="1"
            p="2"
            rounded="full"
            _pressed={{ bg: 'primary.700' }}
            onPress={() => {
              dispatch(
                groupsSlice.actions.setAllPlayersActive({
                  groupId: id,
                  active: !allActive,
                }),
              )
              //
            }}
          >
            <Icon
              size="lg"
              color={tintColor}
              as={<MaterialCommunityIcons name="checkbox-multiple-outline" />}
            />
          </Pressable>
          <Pressable
            mr="1"
            p="2"
            rounded="full"
            _pressed={{ bg: 'primary.700' }}
            onPress={() => {
              navigation.navigate('Player', { groupId: id, id: none })
            }}
          >
            <Icon
              size="lg"
              color={tintColor}
              as={<MaterialIcons name="add" />}
            />
          </Pressable>
        </Flex>
      ),
    })
  }, [allActive])

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
          navigation.navigate('Result', { id })
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
  const { id, name, position, rating, active } = props.data
  const dispatch = useAppDispatch()

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
        <Checkbox.Group
          value={active ? ['true'] : []}
          onChange={(v: string[]) => {
            dispatch(
              groupsSlice.actions.setPlayerActive({
                groupId,
                playerId: id,
                active: !!v.length,
              }),
            )
          }}
        >
          <Checkbox m="1" size="lg" value="true" accessibilityLabel="Ativo" />
        </Checkbox.Group>
        <Flex
          alignSelf="stretch"
          justify="center"
          align="center"
          p="1"
          style={{ aspectRatio: 1 }}
          rounded="full"
          bg="amber.300"
        >
          <Text fontSize="md" bold>
            {position}
          </Text>
        </Flex>
        <Text p="1" bold>
          {rating}
        </Text>
        <Text isTruncated>{name}</Text>
      </Flex>
    </Pressable>
  )
}
