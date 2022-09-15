import { Slug } from '@common/src/datatypes/String'
import { isLeft } from 'fp-ts/lib/Either'
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
import { NameFromString } from 'src/domain/Agent'
import { t } from 'src/i18n'
import { api } from 'src/redux/api'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { O } from 'src/utils/fp-ts'
import { RegisterContainer } from '../components/RegisterContainer'

export const BusinessInfo = (
  props: RootStackScreenProps<'Auth/BusinessInfo'>,
) => {
  const { navigation } = props
  const [updateRealtor, updateRealtorMutation] =
    api.endpoints.updateRealtor.useMutation()
  const [realtorInfo, realtorInfoMutation] =
    api.endpoints.realtorInfo.useMutation()
  const [name, setName] = useState('')
  const [errors, setErrors] = useState<Option<NonEmptyArray<string>>>(none)

  const proceed = async () => {
    const validation = Slug.Decoder.decode(name)
    if (isLeft(validation)) {
      return setErrors(some([t('required_field')]))
    }
    const res = await updateRealtor({
      name: none,
      websiteSlug: some(some(validation.right)),
    })
    if ('error' in res) {
      return alert(JSON.stringify(res.error))
    } else {
      const res = await realtorInfo()
      if ('error' in res) {
        return alert(JSON.stringify(res.error))
      } else if (isLeft(res.data)) {
        return alert(draw(res.data.left))
      } else {
        navigation.popToTop()
        navigation.replace('Drawer', { screen: 'Core/Home' })
      }
    }
  }

  return (
    <RegisterContainer withHeader>
      <Flex>
        <Text textAlign="center" fontSize="2xl">
          {t('business_info')}
        </Text>
      </Flex>
      <FormControl
        isInvalid={isSome(errors)}
        isRequired
        isDisabled={
          updateRealtorMutation.isLoading || realtorInfoMutation.isLoading
        }
        p={2}
      >
        <FormControl.Label>{t('agency_name')}</FormControl.Label>
        <Input
          placeholder={t('agency_name_example')}
          blurOnSubmit={false}
          returnKeyType="next"
          autoFocus
          value={name}
          textContentType="name"
          onChangeText={t => {
            setName(t)
            setErrors(none)
          }}
          onSubmitEditing={() => {
            const validation = NameFromString(name)
            if (isLeft(validation)) {
              setErrors(O.some(validation.left))
            } else {
              proceed()
            }
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
        isDisabled={isSome(errors)}
        isLoading={
          updateRealtorMutation.isLoading || realtorInfoMutation.isLoading
        }
        colorScheme="primary"
        onPress={proceed}
      >
        OK
      </Button>
    </RegisterContainer>
  )
}
