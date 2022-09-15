import { NonEmptyString, PhoneNumber } from '@common/src/datatypes/String'
import { isLeft } from 'fp-ts/lib/Either'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import { isSome, none, Option, some } from 'fp-ts/lib/Option'
import { draw } from 'io-ts/lib/Decoder'
import {
  Button,
  Flex,
  FormControl,
  Text,
  WarningOutlineIcon,
} from 'native-base'
import { useRef, useState } from 'react'
import PhoneInput from 'react-native-phone-number-input'
import { mergeRegistrationData } from 'src/features/realtor/slices/registration'
import { t } from 'src/i18n'
import { api } from 'src/redux/api'
import { useAppDispatch } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { O } from 'src/utils/fp-ts'
import { RegisterContainer } from '../components/RegisterContainer'

type Props = RootStackScreenProps<'Auth/PhoneNumber'>

export const PhoneNumberView = (props: Props) => {
  const { navigation } = props
  const dispatch = useAppDispatch()
  const [startAuth, startAuthMutation] =
    api.endpoints.startSmsAuthentication.useMutation()
  const phoneInput = useRef<PhoneInput>(null)
  const [number, setNumber] = useState('')
  const [errors, setErrors] = useState<Option<NonEmptyArray<string>>>(none)

  const valid = phoneInput.current?.isValidNumber('+' + number) ?? false

  const proceed = async () => {
    const numberVal = NonEmptyString.FromString.decode(number)
    if (isLeft(numberVal)) return setErrors(some([t('required_field')]))
    if (!valid) return setErrors(some([t('invalid_phone_number')]))
    const res = await startAuth({ phoneNumber: number as PhoneNumber })
    if ('error' in res) {
      return alert(JSON.stringify(res.error))
    } else if (isLeft(res.data)) {
      return alert(draw(res.data.left))
    } else {
      dispatch(mergeRegistrationData({ phoneNumber: number as PhoneNumber }))
      navigation.navigate('Auth/VerificationCode')
    }
  }

  return (
    <RegisterContainer withHeader>
      <Flex>
        <Text p={2} textAlign="center" fontSize="lg">
          {t('enter_phone_number')}
        </Text>
      </Flex>
      <FormControl isInvalid={isSome(errors)} isRequired p={2}>
        <PhoneInput
          containerStyle={{ alignSelf: 'center', margin: 8 }}
          ref={phoneInput}
          // defaultValue={value}
          placeholder={'11912341234'}
          defaultCode="BR"
          layout="first"
          // onChangeText={text => {
          //   setValue(text)
          // }}
          onChangeFormattedText={raw => {
            setNumber(raw.replace(/\D/g, ''))
            setErrors(none)
          }}
          // withDarkTheme
          withShadow
          autoFocus
          textInputProps={{
            returnKeyType: 'next',
            onSubmitEditing: proceed,
            blurOnSubmit: false,
          }}
        />
        {O.getOrElseW(() => [])(errors).map((e, i) => (
          <FormControl.ErrorMessage
            key={i}
            leftIcon={<WarningOutlineIcon size="xs" />}
          >
            {e}
          </FormControl.ErrorMessage>
        ))}
      </FormControl>

      <Button
        m={2}
        isDisabled={!valid}
        colorScheme="primary"
        onPress={proceed}
        isLoading={startAuthMutation.isLoading}
      >
        {t('receive_2fa_by_sms')}
      </Button>
    </RegisterContainer>
  )
}
