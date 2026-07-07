import { String } from 'effect'
import { router, Stack } from 'expo-router'
import {
  Input,
  KeyboardAvoidingView,
  MaterialIcons,
  Pressable,
  Row,
  SafeAreaView,
  ScrollView,
  Txt,
  View,
} from 'src/components'
import { FormLabel } from 'src/components/derivative/FormLabel'
import { GhostButton } from 'src/components/derivative/GhostButton'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { useRuntime } from 'src/contexts/Runtime'
import { Modality } from 'src/datatypes'
import { staticModalities } from 'src/datatypes/Modality'
import {
  changeGroupModality,
  changeGroupName,
  saveGroup,
} from 'src/events/groups'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'

export default function GroupEditScreen() {
  const runtime = useRuntime()
  const isEnabled = useSelector(s => String.isNonEmpty(s.groupForm.name.trim()))
  const isEdit = useSelector(s => s.groupForm.id !== null)
  return (
    <SafeAreaView flex={1} edges={['bottom']}>
      <KeyboardAvoidingView>
        <Stack.Title>{isEdit ? t('Edit group') : t('New group')}</Stack.Title>
        <ScrollView
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View flex={1} p={16}>
            <NameField />
            <ModalityField />
          </View>
        </ScrollView>
        <SolidButton
          onPress={() => saveGroup.pipe(runtime.runPromiseExit)}
          isEnabled={isEnabled}
          p={16}
          round={0}
          color={Colors.header}
        >
          <Txt>{t('Save')}</Txt>
        </SolidButton>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const NameField = () => {
  const name = useSelector(s => s.groupForm.name)
  return (
    <View p={4}>
      <FormLabel>{t('Name')}</FormLabel>
      <Input
        placeholder={t('Ex: Thursday soccer')}
        value={name}
        onChange={changeGroupName}
        autoFocus={true}
      />
    </View>
  )
}

const ModalityField = () => {
  const customModalities = useSelector(s => s.customModalities)
  const modalities = [...customModalities, ...staticModalities]
  return (
    <View p={4}>
      <Row justify="space-between" align="center">
        <FormLabel>{t('Modality/Sport')}</FormLabel>
        <GhostButton
          onPress={() => router.navigate(`/modalities`)}
          alignSelf="center"
        >
          <Row align="center" gap={8}>
            <MaterialIcons name="edit" size={16} />
            <Txt size={12}>{t('Edit modalities')}</Txt>
          </Row>
        </GhostButton>
      </Row>
      <View>
        {modalities.map(m => (
          <ModalityItem key={m.id} {...m} />
        ))}
      </View>
    </View>
  )
}

const ModalityItem = (props: Modality) => {
  const runtime = useRuntime()
  const isActive = useSelector(s => s.groupForm.modality.id === props.id)
  return (
    <Pressable
      key={props.id}
      onPress={() => changeGroupModality(props).pipe(runtime.runPromiseExit)}
      py={4}
      px={12}
      round={8}
      align="center"
      direction="row"
      bg={isActive ? Colors.opacity(0.125)(Colors.primary) : undefined}
      rippleColor={Colors.opacity(0.125)(Colors.primary)}
      rippleOpacity={0.1}
    >
      <View w={50}>
        {isActive ? (
          <MaterialIcons name="check" color={Colors.primary} />
        ) : null}
      </View>
      <Txt flex={1} align="center" p={8} size={16} weight={500}>
        {props.name}
      </Txt>
      <View w={50} />
    </Pressable>
  )
}
