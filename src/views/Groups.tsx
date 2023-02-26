import { MaterialIcons } from '@expo/vector-icons'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { none, Option, some } from 'fp-ts/lib/Option'
import {
  Button,
  FlatList,
  FormControl,
  Icon,
  Input,
  Modal,
  Pressable,
} from 'native-base'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Text, View } from 'react-native'
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
            mr="1"
            p="2"
            rounded="full"
            _pressed={{ bg: 'primary.700' }}
            onPress={() => setModal(some(none))}
          >
            <Icon
              size="lg"
              color={tintColor}
              as={<MaterialIcons name="add" />}
            />
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
        <Pressable px="1" onPress={() => props.openEdit(id)}>
          <Icon size="lg" color="gray.500" as={<MaterialIcons name="edit" />} />
        </Pressable>
        <Pressable px="1" onPress={() => props.openDelete(id)}>
          <Icon
            size="lg"
            color="gray.500"
            as={<MaterialIcons name="delete" />}
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
          <Button.Group space="2">
            <Button variant="ghost" onPress={props.onClose}>
              Cancelar
            </Button>
            <Button
              isDisabled={!groupName}
              onPress={
                Str.isEmpty(groupName)
                  ? constVoid
                  : pipe(
                      IOO.fromIO(props.onClose),
                      IOO.chainOptionK(() => group),
                      IOO.matchEW(
                        () => () => (): unknown =>
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
              Gravar
            </Button>
          </Button.Group>
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
          <Button.Group space="2">
            <Button
              variant="ghost"
              colorScheme="danger"
              onPress={props.onClose}
            >
              Cancelar
            </Button>
            <Button
              colorScheme="danger"
              onPress={pipe(
                IOO.fromIO(props.onClose),
                IOO.chainOptionK(() => group),
                IOO.chainIOK(
                  g => () => dispatch(groupsSlice.actions.delete({ id: g.id })),
                ),
              )}
            >
              Excluir
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  )
}
