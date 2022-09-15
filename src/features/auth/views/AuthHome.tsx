import { MaterialIcons } from '@expo/vector-icons'
import {
  Button,
  Flex,
  FormControl,
  Heading,
  Icon,
  Input,
  Modal,
  Pressable,
  useDisclose,
} from 'native-base'
import { useState } from 'react'
import { setPreviewData } from 'src/features/core/slices/preview'
import { PreviewDataStorage } from 'src/features/core/storage'
import { t } from 'src/i18n'
import { useAppDispatch } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { envName } from 'src/utils/Env'
import { RegisterContainer } from '../components/RegisterContainer'

type Props = RootStackScreenProps<'Auth/AuthHome'>

export const AuthHome = (props: Props) => {
  const { navigation } = props
  const dispatch = useAppDispatch()
  const modal = useDisclose()
  const [serverUrl, setServerUrl] = useState('')

  return (
    <RegisterContainer withHeader>
      <Heading p={2} textAlign="center">
        {t('hello')}
      </Heading>
      <Flex flex={1} />
      <Button m={2} onPress={() => navigation.navigate('Auth/PhoneNumber')}>
        {t('lets_start')}
      </Button>
      {envName !== 'production' && (
        <>
          <Flex position="absolute" bottom={0} right={0}>
            <Pressable onPress={modal.onOpen}>
              <Icon as={<MaterialIcons name="settings" />} size="md" />
            </Pressable>
          </Flex>
          <Modal isOpen={modal.isOpen} onClose={modal.onClose}>
            <Modal.Content maxWidth="400px">
              <Modal.CloseButton />
              <Modal.Header>Preview Settings</Modal.Header>
              <Modal.Body>
                <FormControl>
                  <FormControl.Label>Server URL</FormControl.Label>
                  <Input
                    value={serverUrl}
                    onChangeText={setServerUrl}
                    placeholder="http://172.16.1.67:3000"
                    autoCapitalize="none"
                    keyboardType="url"
                    textContentType="URL"
                  />
                </FormControl>
              </Modal.Body>
              <Modal.Footer>
                <Button.Group space={2}>
                  <Button
                    variant="ghost"
                    colorScheme="blueGray"
                    onPress={modal.onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    onPress={() => {
                      dispatch(setPreviewData({ serverUrl }))
                      PreviewDataStorage.set({ serverUrl })()
                      modal.onClose()
                    }}
                  >
                    Save
                  </Button>
                </Button.Group>
              </Modal.Footer>
            </Modal.Content>
          </Modal>
        </>
      )}
    </RegisterContainer>
  )
}
