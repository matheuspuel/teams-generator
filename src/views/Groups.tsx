import { MaterialIcons } from '@expo/vector-icons'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
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
import { Group } from 'src/datatypes/Group'
import { getGroups, groupsSlice } from 'src/redux/slices/groups'
import { useAppDispatch, useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'

export const Groups = (props: RootStackScreenProps<'Groups'>) => {
  const { navigation } = props
  const dispatch = useAppDispatch()
  const groups = useAppSelector(getGroups)
  const modalAdd = useDisclose()
  const [groupName, setGroupName] = useState('')

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
    <Flex flex={1} onLayout={() => SplashScreen.hideAsync()}>
      <StatusBar style="light" />
      <FlatList
        data={groups}
        renderItem={({ item }) => <Item data={item} parentProps={props} />}
      />
      <Modal isOpen={modalAdd.isOpen}>
        <Modal.Content>
          <Modal.Header>
            Novo grupo
            <Modal.CloseButton onPress={modalAdd.onClose} />
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
              <Button variant="ghost" onPress={modalAdd.onClose}>
                Cancelar
              </Button>
              <Button
                isDisabled={!groupName}
                onPress={() => {
                  if (!groupName) return
                  modalAdd.onClose()
                  dispatch(groupsSlice.actions.add({ name: groupName }))
                  setGroupName('')
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
