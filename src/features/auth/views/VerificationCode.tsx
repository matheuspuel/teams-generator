import { SmsCode } from '@common/src/datatypes/String'
import { isLeft } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import { isSome, none, Option, some } from 'fp-ts/lib/Option'
import { draw } from 'io-ts/lib/Decoder'
import {
  Button,
  Flex,
  FormControl,
  Input,
  Text,
  WarningOutlineIcon,
} from 'native-base'
import { useState } from 'react'
import { t } from 'src/i18n'
import { api } from 'src/redux/api'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { toErrorTypeArray } from 'src/utils/Decoder'
import { A, O, RA } from 'src/utils/fp-ts'
import { RegisterContainer } from '../components/RegisterContainer'

// type String6 = NonEmptyString
// type Digits6 = String6
// type VerificationCode = Digits6

// const String6FromNonEmptyString: Parse<String6, NonEmptyString> =
//   E.fromPredicate(
//     (v): v is String6 => v.length === 6,
//     () => [t('must_have_6_digits')],
//   )

// const Digits6FromString6: Parse<Digits6, String6> = E.fromPredicate(
//   (v): v is String6 => /^\d*$/.test(v),
//   () => [t('must_have_digits_only')],
// )

// export const VerificationCodeFromString: Parse<VerificationCode, string> = flow(
//   NonEmptyStringFromString,
//   E.chain(String6FromNonEmptyString),
//   E.chain(Digits6FromString6),
// )

type Props = RootStackScreenProps<'Auth/VerificationCode'>

export const VerificationCode = (props: Props) => {
  const { navigation } = props
  const [smsLogin, smsLoginMutation] = api.endpoints.smsLogin.useMutation()
  const [realtorInfo, realtorInfoMutation] =
    api.endpoints.realtorInfo.useMutation()
  const [value, setValue] = useState('')
  const [errors, setErrors] = useState<Option<NonEmptyArray<string>>>(none)

  const proceed = async () => {
    const validation = SmsCode.FromString.decode(value)
    if (isLeft(validation)) {
      const defaultError = t('must_have_6_digits')

      const errorTextList = pipe(
        validation.left,
        toErrorTypeArray,
        RA.toArray,
        A.map(error =>
          error === 'NonEmptyString'
            ? t('required_field')
            : error === 'StringExact6'
            ? t('must_have_6_digits')
            : error === 'Digits'
            ? t('must_have_digits_only')
            : defaultError,
        ),
      )

      return setErrors(some(errorTextList as NonEmptyArray<string>))
    }

    const res = await smsLogin({ smsCode: validation.right })
    if ('error' in res) {
      return alert(JSON.stringify(res.error))
    } else if (isLeft(res.data)) {
      return alert(draw(res.data.left))
    } else {
      const res = await realtorInfo()
      if ('error' in res) {
        if ('status' in res.error && res.error.status === 404) {
          return navigation.replace('Auth/PersonalInfo')
        } else {
          return alert(JSON.stringify(res.error))
        }
      } else if (isLeft(res.data)) {
        return alert(draw(res.data.left))
      } else {
        if (isSome(res.data.right.websiteSlug)) {
          navigation.popToTop()
          navigation.replace('Drawer', { screen: 'Core/Home' })
        } else {
          return navigation.replace('Auth/BusinessInfo')
        }
      }
    }
  }

  return (
    <RegisterContainer withHeader>
      <Flex>
        <Text p={2} textAlign="center" fontSize="lg">
          {t('enter_verification_code')}
        </Text>
      </Flex>
      <FormControl
        isInvalid={isSome(errors)}
        isRequired
        p={2}
        isDisabled={smsLoginMutation.isLoading || realtorInfoMutation.isLoading}
      >
        <Input
          textContentType="oneTimeCode"
          keyboardType="numeric"
          autoFocus
          placeholder="123456"
          value={value}
          onChangeText={r => {
            setValue(r.replace(/\D/g, '').substring(0, 6))
            setErrors(none)
          }}
          fontSize="4xl"
          textAlign="center"
          returnKeyType="next"
          onSubmitEditing={proceed}
          blurOnSubmit={false}
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
        isDisabled={isLeft(SmsCode.FromString.decode(value))}
        onPress={proceed}
        isLoading={smsLoginMutation.isLoading || realtorInfoMutation.isLoading}
      >
        OK
      </Button>
    </RegisterContainer>
  )
}
