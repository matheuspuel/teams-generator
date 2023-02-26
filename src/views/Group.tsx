import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import {
  Button,
  Checkbox,
  FlatList,
  Icon,
  IconButton,
  Modal,
  Pressable,
  Text,
  useDisclose,
} from 'native-base'
import { useLayoutEffect } from 'react'
import { View } from 'react-native'
import { Player, PlayerIsActive, RatingShow } from 'src/datatypes/Player'
import { getGroupById, groupsSlice } from 'src/redux/slices/groups'
import { getParameters, parametersSlice } from 'src/redux/slices/parameters'
import { useAppDispatch, useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { theme } from 'src/theme'
import { A, Eq, IO, none, O, pipe, some } from 'src/utils/fp-ts'

export const Group = (props: RootStackScreenProps<'Group'>) => {
  const { navigation, route } = props
  const { id } = route.params
  const dispatch = useAppDispatch()
  const group = useAppSelector(getGroupById(id), O.getEq(Eq.eqStrict).equals)
  const modalParameters = useDisclose()

  const players: Array<Player> = pipe(
    group,
    O.map(g => g.players),
    O.getOrElseW(() => []),
  )

  const allActive = pipe(players, A.every(PlayerIsActive))

  useLayoutEffect(
    () =>
      navigation.setOptions({
        headerRight: ({ tintColor }) => (
          <View style={{ flexDirection: 'row' }}>
            <Pressable
              mr="1"
              p="2"
              rounded="full"
              _pressed={{ bg: 'primary.700' }}
              onPress={() =>
                dispatch(
                  groupsSlice.actions.setAllPlayersActive({
                    groupId: id,
                    active: !allActive,
                  }),
                )
              }
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
              onPress={() =>
                navigation.navigate('Player', { groupId: id, id: none })
              }
            >
              <Icon
                size="lg"
                color={tintColor}
                as={<MaterialIcons name="add" />}
              />
            </Pressable>
          </View>
        ),
      }),
    [allActive],
  )

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={players}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => <Item data={item} parentProps={props} />}
        initialNumToRender={20}
      />
      <Button rounded="none" onPress={modalParameters.onOpen}>
        Sortear
      </Button>
      <ParametersModal {...props} {...modalParameters} />
    </View>
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
      onPress={() => navigation.navigate('Player', { groupId, id: some(id) })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.white,
          margin: 4,
          padding: 4,
          borderRadius: 8,
          elevation: 1,
        }}
      >
        <Checkbox.Group
          value={active ? ['true'] : []}
          onChange={(v: Array<string>) =>
            dispatch(
              groupsSlice.actions.setPlayerActive({
                groupId,
                playerId: id,
                active: !!v.length,
              }),
            )
          }
        >
          <Checkbox m="1" size="lg" value="true" accessibilityLabel="Ativo" />
        </Checkbox.Group>
        <View
          style={{
            aspectRatio: 1,
            alignSelf: 'stretch',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 4,
            borderRadius: 9999,
            backgroundColor: theme.colors.amber[300],
          }}
        >
          <Text fontSize="md" bold>
            {position}
          </Text>
        </View>
        <Text p="1" bold>
          {RatingShow.show(rating)}
        </Text>
        <Text isTruncated>{name}</Text>
      </View>
    </Pressable>
  )
}

const ParametersModal = (
  props: RootStackScreenProps<'Group'> & {
    isOpen: boolean
    onClose: IO<void>
  },
) => {
  const { navigation, route } = props
  const { id } = route.params
  const dispatch = useAppDispatch()
  const parameters = useAppSelector(getParameters)

  return (
    <Modal isOpen={props.isOpen}>
      <Modal.Content>
        <Modal.Header>
          Parâmetros
          <Modal.CloseButton onPress={props.onClose} />
        </Modal.Header>
        <Modal.Body>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              onPress={() =>
                dispatch(parametersSlice.actions.decrementTeamsCount())
              }
              icon={<Icon as={<MaterialIcons name="remove" />} />}
            />
            <Text p="2" bold>
              {parameters.teamsCount}
            </Text>
            <IconButton
              onPress={() =>
                dispatch(parametersSlice.actions.incrementTeamsCount())
              }
              icon={<Icon as={<MaterialIcons name="add" />} />}
            />
            <Text flex={1} pl="2">
              Número de times
            </Text>
          </View>
          <Checkbox.Group
            value={parameters.position ? ['true'] : []}
            onChange={(v: Array<string>) =>
              dispatch(parametersSlice.actions.setPosition(!!v.length))
            }
          >
            <Checkbox m="1" size="lg" value="true" _text={{ fontSize: 'sm' }}>
              Considerar posições
            </Checkbox>
          </Checkbox.Group>
          <Checkbox.Group
            value={parameters.rating ? ['true'] : []}
            onChange={(v: Array<string>) =>
              dispatch(parametersSlice.actions.setRating(!!v.length))
            }
          >
            <Checkbox m="1" size="lg" value="true" _text={{ fontSize: 'sm' }}>
              Considerar habilidade
            </Checkbox>
          </Checkbox.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space="2">
            <Button variant="ghost" onPress={props.onClose}>
              Cancelar
            </Button>
            <Button
              onPress={pipe(
                props.onClose,
                IO.chain(() => () => navigation.navigate('Result', { id })),
              )}
            >
              Sortear
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  )
}
