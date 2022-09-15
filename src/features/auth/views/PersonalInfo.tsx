import { Email, NonEmptyString } from '@common/src/datatypes/String'
import { sequenceS } from 'fp-ts/lib/Apply'
import { isLeft } from 'fp-ts/lib/Either'
import { constant, flow, pipe } from 'fp-ts/lib/function'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import { isSome, none, Option, some } from 'fp-ts/lib/Option'
import {
  Button,
  Flex,
  FormControl,
  Input,
  Text,
  WarningOutlineIcon,
} from 'native-base'
import { useRef, useState } from 'react'
import { TextInput } from 'react-native'
import {
  CreciFromString,
  EmailFromString,
  NameFromString,
} from 'src/domain/Agent'
import { t } from 'src/i18n'
import { api } from 'src/redux/api'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { toErrorTypeArray } from 'src/utils/Decoder'
import { E, NEA, O, Rec } from 'src/utils/fp-ts'
import { RegisterContainer } from '../components/RegisterContainer'

type Props = RootStackScreenProps<'Auth/PersonalInfo'>

export const PersonalInfo = (props: Props) => {
  const { navigation } = props
  const [register, registerMutation] = api.endpoints.register.useMutation()
  const refInput1 = useRef<TextInput>()
  const refInput2 = useRef<TextInput>()
  const refInput3 = useRef<TextInput>()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [creci, setCreci] = useState('')
  const [errors, setErrors] = useState<{
    name: Option<string[]>
    email: Option<string[]>
    creci: Option<string[]>
  }>({ name: none, email: none, creci: none })

  const proceed = async () => {
    const validations = {
      name: NonEmptyString.FromString.decode(name),
      email: Email.FromString.decode(email),
      creci: NonEmptyString.FromString.decode(creci),
    }
    const mergedValidations = sequenceS(E.Apply)(validations)
    if (isLeft(mergedValidations)) {
      setErrors({
        name: pipe(
          validations.name,
          E.match(() => some([t('required_field')]), constant(none)),
        ),
        email: pipe(
          validations.email,
          E.match(
            flow(
              toErrorTypeArray,
              v => v as NonEmptyArray<string>,
              NEA.map(v =>
                v === 'NonEmptyString'
                  ? t('required_field')
                  : t('invalid_email'),
              ),
              O.of,
            ),
            constant(none),
          ),
        ),
        creci: pipe(
          validations.creci,
          E.match(() => some([t('required_field')]), constant(none)),
        ),
      })
    } else {
      const res = await register(mergedValidations.right)
      if ('error' in res) {
        return alert(JSON.stringify(res.error))
      } else {
        navigation.navigate('Auth/BusinessInfo')
      }
    }
  }

  return (
    <RegisterContainer withHeader>
      <Flex>
        <Text textAlign="center" fontSize="2xl">
          {t('personal_info')}
        </Text>
      </Flex>
      <FormControl
        isInvalid={isSome(errors.name)}
        isRequired
        isDisabled={registerMutation.isLoading}
        p={2}
      >
        <FormControl.Label>{t('name')}</FormControl.Label>
        <Input
          ref={refInput1}
          placeholder="John Garcia"
          blurOnSubmit={false}
          returnKeyType="next"
          autoFocus
          value={name}
          textContentType="name"
          onChangeText={t => {
            setName(t)
            setErrors(es => (isSome(es.name) ? { ...es, name: none } : es))
          }}
          onBlur={() => {
            const validation = NameFromString(name)
            if (isLeft(validation)) {
              setErrors({ ...errors, name: O.some(validation.left) })
            }
          }}
          onSubmitEditing={() => {
            const validation = NameFromString(name)
            if (isLeft(validation)) {
              setErrors({ ...errors, name: O.some(validation.left) })
            } else {
              refInput2.current?.focus()
            }
          }}
        />
        {O.getOrElseW(() => [])(errors.name).map((e, i) => (
          <FormControl.ErrorMessage
            key={i}
            leftIcon={<WarningOutlineIcon size="xs" />}
          >
            {e}
          </FormControl.ErrorMessage>
        ))}
      </FormControl>
      <FormControl
        isInvalid={isSome(errors.email)}
        isRequired
        isDisabled={registerMutation.isLoading}
        p={2}
      >
        <FormControl.Label>{t('email')}</FormControl.Label>
        <Input
          ref={refInput2}
          placeholder="johngarcia@gmail.com"
          blurOnSubmit={false}
          returnKeyType="next"
          value={email}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoCapitalize="none"
          onChangeText={t => {
            setEmail(t)
            setErrors(es => (isSome(es.email) ? { ...es, email: none } : es))
          }}
          onBlur={() => {
            const validation = EmailFromString(email)
            if (isLeft(validation)) {
              setErrors({ ...errors, email: O.some(validation.left) })
            }
          }}
          onSubmitEditing={() => {
            const validation = EmailFromString(email)
            if (isLeft(validation)) {
              setErrors({ ...errors, email: O.some(validation.left) })
            } else {
              refInput3.current?.focus()
            }
          }}
        />
        {O.getOrElseW(() => [])(errors.email).map((e, i) => (
          <FormControl.ErrorMessage
            key={i}
            leftIcon={<WarningOutlineIcon size="xs" />}
          >
            {e}
          </FormControl.ErrorMessage>
        ))}
      </FormControl>
      <FormControl
        isInvalid={isSome(errors.creci)}
        isRequired
        isDisabled={registerMutation.isLoading}
        p={2}
      >
        <FormControl.Label>{t('creci')}</FormControl.Label>
        <Input
          ref={refInput3}
          placeholder="123456"
          blurOnSubmit={false}
          returnKeyType="next"
          value={creci}
          onChangeText={t => {
            setCreci(t)
            setErrors(es => (isSome(es.creci) ? { ...es, creci: none } : es))
          }}
          onBlur={() => {
            const validation = CreciFromString(creci)
            if (isLeft(validation)) {
              setErrors({ ...errors, creci: O.some(validation.left) })
            }
          }}
          onSubmitEditing={() => {
            const validation = CreciFromString(creci)
            if (isLeft(validation)) {
              setErrors({ ...errors, creci: O.some(validation.left) })
            } else {
              proceed()
            }
          }}
        />
        {O.getOrElseW(() => [])(errors.creci).map((e, i) => (
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
        isDisabled={Rec.some(isSome)(errors)}
        isLoading={registerMutation.isLoading}
        colorScheme="primary"
        onPress={proceed}
      >
        OK
      </Button>
    </RegisterContainer>
  )
}
