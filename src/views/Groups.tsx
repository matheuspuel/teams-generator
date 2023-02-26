import { MaterialIcons } from '@expo/vector-icons'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { none, Option, some } from 'fp-ts/lib/Option'
import { FormControl, Input, Modal } from 'native-base'
import { useEffect, useLayoutEffect, useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { Group } from 'src/datatypes/Group'
import { getGroupById, getGroups, groupsSlice } from 'src/redux/slices/groups'
import { useAppDispatch, useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { theme } from 'src/theme'
import { Id } from 'src/utils/Entity'
import { constVoid, Eq, IO, IOO, O, pipe, Str } from 'src/utils/fp-ts'

export const Groups = (props: RootStackScreenProps<'Groups'>) => {
  const { navigation } = props
  const groups = useAppSelector(getGroups)
  const [modal, setModal] = useState<Option<Option<{ id: Id }>>>(none)
  const [deleteModal, setDeleteModal] = useState<Option<{ id: Id }>>(none)

  useLayoutEffect(
    () =>
      navigation.setOptions({
        headerRight: ({ tintColor }) => (
          <Pressable
            style={({ pressed }) => ({
              marginRight: 4,
              padding: 8,
              borderRadius: 100,
              backgroundColor: pressed ? theme.colors.primary[700] : undefined,
            })}
            onPress={() => setModal(some(none))}
          >
            <MaterialIcons name="add" color={tintColor} size={24} />
          </Pressable>
        ),
      }),
    [],
  )

  return (
    <View style={{ flex: 1 }} onLayout={() => void SplashScreen.hideAsync()}>
      <StatusBar style="light" />
      <FlatList
        data={groups}
        renderItem={({ item }) => (
          <Item
            data={item}
            parentProps={props}
            openEdit={id => setModal(some(some({ id })))}
            openDelete={id => setDeleteModal(some({ id }))}
          />
        )}
      />
      <GroupModal {...props} state={modal} onClose={() => setModal(none)} />
      <DeleteGroupModal
        {...props}
        state={deleteModal}
        onClose={() => setDeleteModal(none)}
      />
    </View>
  )
}
const Item = (props: {
  data: Group
  parentProps: RootStackScreenProps<'Groups'>
  openEdit: (id: Id) => void
  openDelete: (id: Id) => void
}) => {
  const { name, id } = props.data
  const { navigation } = props.parentProps

  return (
    <Pressable onPress={() => navigation.navigate('Group', { id })}>
      <View
        style={{
          backgroundColor: theme.colors.white,
          flexDirection: 'row',
          alignItems: 'center',
          margin: 8,
          padding: 8,
          borderRadius: 8,
          elevation: 1,
        }}
      >
        <Text
          style={{ flex: 1, fontWeight: 'bold', color: theme.colors.darkText }}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Pressable
          style={{ paddingHorizontal: 4 }}
          onPress={() => props.openEdit(id)}
        >
          <MaterialIcons name="edit" color={theme.colors.gray[500]} size={24} />
        </Pressable>
        <Pressable
          style={{ paddingHorizontal: 4 }}
          onPress={() => props.openDelete(id)}
        >
          <MaterialIcons
            name="delete"
            color={theme.colors.gray[500]}
            size={24}
          />
        </Pressable>
      </View>
    </Pressable>
  )
}

const GroupModal = (
  props: RootStackScreenProps<'Groups'> & {
    state: Option<Option<{ id: Id }>>
    onClose: () => void
  },
) => {
  const dispatch = useAppDispatch()
  const group = useAppSelector(
    pipe(
      props.state,
      O.flatten,
      O.map(({ id }) => id),
      O.map(getGroupById),
      O.getOrElseW(() => () => none),
    ),
    O.getEq(Eq.eqStrict).equals,
  )
  const [groupName, setGroupName] = useState('')

  useEffect(
    () =>
      setGroupName(
        pipe(
          group,
          O.map(g => g.name),
          O.getOrElse(() => ''),
        ),
      ),
    [group],
  )

  return (
    <Modal isOpen={O.isSome(props.state)}>
      <Modal.Content>
        <Modal.Header>
          {pipe(
            props.state,
            O.flatten,
            O.match(
              () => 'Novo grupo',
              () => 'Editar grupo',
            ),
          )}
          <Modal.CloseButton onPress={props.onClose} />
        </Modal.Header>
        <Modal.Body>
          <FormControl>
            <FormControl.Label>Nome do grupo</FormControl.Label>
            <Input
              placeholder="Ex: Futebol de quinta"
              value={groupName}
              onChangeText={setGroupName}
            />
          </FormControl>
        </Modal.Body>
        <Modal.Footer>
          <View style={{ flexDirection: 'row' }}>
            <Pressable
              style={({ pressed }) => ({
                marginRight: 8,
                padding: 12,
                backgroundColor: pressed
                  ? theme.colors.primary[600] + '1f'
                  : undefined,
                borderRadius: 4,
              })}
              onPress={props.onClose}
            >
              <Text style={{ color: theme.colors.primary[600] }}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => ({
                padding: 12,
                backgroundColor: !groupName
                  ? theme.colors.primary[600] + '5f'
                  : pressed
                  ? theme.colors.primary[800]
                  : theme.colors.primary[600],
                borderRadius: 4,
              })}
              onPress={
                Str.isEmpty(groupName)
                  ? constVoid
                  : pipe(
                      IOO.fromIO(props.onClose),
                      IOO.chainOptionK(() => group),
                      IOO.matchEW(
                        () => (): unknown =>
                          dispatch(
                            groupsSlice.actions.add({ name: groupName }),
                          ),
                        g => (): unknown =>
                          dispatch(
                            groupsSlice.actions.edit({
                              id: g.id,
                              name: groupName,
                            }),
                          ),
                      ),
                      IO.chainFirst(() => () => setGroupName('')),
                    )
              }
            >
              <Text
                style={{
                  color: !groupName
                    ? theme.colors.white + '5f'
                    : theme.colors.white,
                }}
              >
                Gravar
              </Text>
            </Pressable>
          </View>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  )
}

const DeleteGroupModal = (
  props: RootStackScreenProps<'Groups'> & {
    state: Option<{ id: Id }>
    onClose: () => void
  },
) => {
  const group = useAppSelector(
    pipe(
      props.state,
      O.map(({ id }) => id),
      O.map(getGroupById),
      O.getOrElseW(() => () => none),
    ),
    O.getEq(Eq.eqStrict).equals,
  )
  const dispatch = useAppDispatch()

  return (
    <Modal isOpen={O.isSome(props.state)}>
      <Modal.Content>
        <Modal.Header>
          Excluir grupo
          <Modal.CloseButton onPress={props.onClose} />
        </Modal.Header>
        <Modal.Body>
          {pipe(
            group,
            O.matchW(
              () => null,
              g => (
                <Text style={{ color: theme.colors.darkText }}>
                  Deseja excluir o grupo{' '}
                  {
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: theme.colors.darkText,
                      }}
                    >
                      {g.name}
                    </Text>
                  }{' '}
                  e todos os jogadores?
                </Text>
              ),
            ),
          )}
        </Modal.Body>
        <Modal.Footer>
          <View style={{ flexDirection: 'row' }}>
            <Pressable
              style={({ pressed }) => ({
                marginRight: 8,
                padding: 12,
                backgroundColor: pressed
                  ? theme.colors.danger[600] + '1f'
                  : undefined,
                borderRadius: 4,
              })}
              onPress={props.onClose}
            >
              <Text style={{ color: theme.colors.danger[600] }}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => ({
                padding: 12,
                backgroundColor: pressed
                  ? theme.colors.danger[800]
                  : theme.colors.danger[600],
                borderRadius: 4,
              })}
              onPress={pipe(
                IOO.fromIO(props.onClose),
                IOO.chainOptionK(() => group),
                IOO.chainIOK(
                  g => () => dispatch(groupsSlice.actions.delete({ id: g.id })),
                ),
              )}
            >
              <Text style={{ color: theme.colors.white }}>Excluir</Text>
            </Pressable>
          </View>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  )
}
