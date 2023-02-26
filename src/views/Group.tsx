import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { Button, IconButton, Modal } from 'native-base'
import { useLayoutEffect } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { Player, PlayerIsActive, RatingShow } from 'src/datatypes/Player'
import { useDisclose } from 'src/hooks/useDisclose'
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
              style={({ pressed }) => ({
                marginRight: 4,
                padding: 8,
                borderRadius: 100,
                backgroundColor: pressed
                  ? theme.colors.primary[700]
                  : undefined,
              })}
              onPress={() =>
                dispatch(
                  groupsSlice.actions.setAllPlayersActive({
                    groupId: id,
                    active: !allActive,
                  }),
                )
              }
            >
              <MaterialCommunityIcons
                name="checkbox-multiple-outline"
                color={tintColor}
                size={24}
              />
            </Pressable>
            <Pressable
              style={({ pressed }) => ({
                marginRight: 4,
                padding: 8,
                borderRadius: 100,
                backgroundColor: pressed
                  ? theme.colors.primary[700]
                  : undefined,
              })}
              onPress={() =>
                navigation.navigate('Player', { groupId: id, id: none })
              }
            >
              <MaterialIcons name="add" color={tintColor} size={24} />
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
        <Pressable
          style={{ marginRight: 4 }}
          onPress={() =>
            dispatch(
              groupsSlice.actions.togglePlayerActive({ groupId, playerId: id }),
            )
          }
        >
          {({ pressed }) =>
            active ? (
              <View
                style={{
                  borderWidth: 2,
                  borderRadius: 4,
                  height: 28,
                  width: 28,
                  backgroundColor: theme.colors.primary[pressed ? 800 : 600],
                  borderColor: theme.colors.primary[pressed ? 800 : 600],
                }}
              >
                <MaterialIcons
                  name="check"
                  size={24}
                  color={theme.colors.white}
                />
              </View>
            ) : (
              <View
                style={{
                  borderWidth: 2,
                  borderRadius: 4,
                  borderColor: theme.colors.gray[pressed ? 600 : 400],
                  height: 28,
                  width: 28,
                }}
              />
            )
          }
        </Pressable>
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
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: theme.colors.darkText,
            }}
          >
            {position}
          </Text>
        </View>
        <Text
          style={{
            padding: 4,
            fontWeight: 'bold',
            color: theme.colors.darkText,
          }}
        >
          {RatingShow.show(rating)}
        </Text>
        <Text style={{ color: theme.colors.darkText }} numberOfLines={1}>
          {name}
        </Text>
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
              icon={
                <MaterialIcons
                  name="remove"
                  size={24}
                  color={theme.colors.primary[600]}
                />
              }
            />
            <Text
              style={{
                padding: 8,
                fontWeight: 'bold',
                color: theme.colors.darkText,
              }}
            >
              {parameters.teamsCount}
            </Text>
            <IconButton
              onPress={() =>
                dispatch(parametersSlice.actions.incrementTeamsCount())
              }
              icon={
                <MaterialIcons
                  name="add"
                  size={24}
                  color={theme.colors.primary[600]}
                />
              }
            />
            <Text
              style={{ flex: 1, paddingLeft: 8, color: theme.colors.darkText }}
            >
              Número de times
            </Text>
          </View>
          <Pressable
            style={{ padding: 4 }}
            onPress={() => dispatch(parametersSlice.actions.togglePosition())}
          >
            {({ pressed }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {parameters.position ? (
                  <View
                    style={{
                      borderWidth: 2,
                      borderRadius: 4,
                      height: 28,
                      width: 28,
                      backgroundColor:
                        theme.colors.primary[pressed ? 800 : 600],
                      borderColor: theme.colors.primary[pressed ? 800 : 600],
                    }}
                  >
                    <MaterialIcons
                      name="check"
                      size={24}
                      color={theme.colors.white}
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      borderWidth: 2,
                      borderRadius: 4,
                      borderColor: theme.colors.gray[pressed ? 600 : 400],
                      height: 28,
                      width: 28,
                    }}
                  />
                )}
                <Text style={{ margin: 4, fontSize: 14 }}>
                  Considerar posições
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable
            style={{ padding: 4 }}
            onPress={() => dispatch(parametersSlice.actions.toggleRating())}
          >
            {({ pressed }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {parameters.rating ? (
                  <View
                    style={{
                      borderWidth: 2,
                      borderRadius: 4,
                      height: 28,
                      width: 28,
                      backgroundColor:
                        theme.colors.primary[pressed ? 800 : 600],
                      borderColor: theme.colors.primary[pressed ? 800 : 600],
                    }}
                  >
                    <MaterialIcons
                      name="check"
                      size={24}
                      color={theme.colors.white}
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      borderWidth: 2,
                      borderRadius: 4,
                      borderColor: theme.colors.gray[pressed ? 600 : 400],
                      height: 28,
                      width: 28,
                    }}
                  />
                )}
                <Text style={{ margin: 4, fontSize: 14 }}>
                  Considerar habilidade
                </Text>
              </View>
            )}
          </Pressable>
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
