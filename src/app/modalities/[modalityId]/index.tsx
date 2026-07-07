import DeleteIcon from '@expo/material-symbols/delete.xml'
import { Array, Either, Option, Runtime } from 'effect'
import { Stack } from 'expo-router'
import { Platform } from 'react-native'
import {
  Input,
  KeyboardAvoidingView,
  MaterialIcons,
  Row,
  SafeAreaView,
  ScrollView,
  Txt,
  View,
} from 'src/components'
import { BorderlessButton } from 'src/components/derivative/BorderlessButton'
import { FormLabel } from 'src/components/derivative/FormLabel'
import { GhostButton } from 'src/components/derivative/GhostButton'
import { SolidButton } from 'src/components/derivative/SolidButton'
import {
  addModalityPosition,
  changeModalityName,
  changeModalityPositionAbbreviation,
  changeModalityPositionName,
  liftModalityPosition,
  openRemoveModality,
  removeModalityPosition,
  submitModality,
} from 'src/events/modality'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { runtime } from 'src/runtime'
import { Colors } from 'src/services/Theme'
import { validateModalityForm } from 'src/slices/modalityForm'

export default function ModalityScreen() {
  const isEnabled = useSelector(s =>
    Either.isRight(validateModalityForm(s.modalityForm)),
  )
  const isEdit = useSelector(s => s.modalityForm.id !== null)
  return (
    <SafeAreaView flex={1} edges={['bottom']}>
      <KeyboardAvoidingView>
        <Stack.Title>
          {isEdit ? t('Edit modality') : t('New modality')}
        </Stack.Title>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            onPress={() =>
              openRemoveModality.pipe(Runtime.runPromiseExit(runtime))
            }
            icon={DeleteIcon}
          />
        </Stack.Toolbar>
        <ScrollView
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View flex={1} p={4}>
            <NameField />
            <PositionsField />
          </View>
        </ScrollView>
        <SolidButton
          onPress={submitModality}
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
  const name = useSelector(s => s.modalityForm.name)
  return (
    <View p={4}>
      <FormLabel>{t('Name')}</FormLabel>
      <Input
        placeholder={t('Ex: Soccer')}
        value={name}
        onChange={changeModalityName}
        autoFocus={true}
      />
    </View>
  )
}

const PositionsField = () => {
  const positionCount = useSelector(s => s.modalityForm.positions.length)
  return (
    <View p={4}>
      <FormLabel>{t('Positions')}</FormLabel>
      <Row p={4}>
        <View w={90}>
          <FormLabel size={12}>{t('Abbreviation')}</FormLabel>
        </View>
        <View>
          <FormLabel size={12}>{t('Name')}</FormLabel>
        </View>
      </Row>
      <View>
        {Array.map(Array.replicate(positionCount)(null), (_, i) => (
          <PositionItem key={i} index={i} />
        ))}
      </View>
      <GhostButton onPress={addModalityPosition} alignSelf="center">
        <Row align="center">
          <MaterialIcons name="add" />
          <Txt>{t('New position')}</Txt>
        </Row>
      </GhostButton>
    </View>
  )
}

const PositionItem = ({ index }: { index: number }) => (
  <Row align="center">
    <PositionAbbreviationField index={index} />
    <PositionNameField index={index} />
    <BorderlessButton onPress={liftModalityPosition(index)}>
      <MaterialIcons name="keyboard-arrow-up" />
    </BorderlessButton>
    <BorderlessButton
      onPress={removeModalityPosition(index)}
      color={Colors.error}
    >
      <MaterialIcons name="delete" />
    </BorderlessButton>
  </Row>
)

const PositionAbbreviationField = ({ index }: { index: number }) => {
  const abbreviation = useSelector(s =>
    Array.get(s.modalityForm.positions, index).pipe(
      Option.map(_ => _.abbreviation),
    ),
  )
  return (
    <View p={4}>
      <Input
        placeholder={t('Ex: GK')}
        w={82}
        value={abbreviation.pipe(Option.getOrElse(() => ''))}
        onChange={t => changeModalityPositionAbbreviation({ index, value: t })}
        autoCapitalize="characters"
        align="center"
        py={Platform.OS === 'ios' ? 12.5 : 6}
        px={Platform.OS === 'ios' ? 8 : 10}
      />
    </View>
  )
}

const PositionNameField = ({ index }: { index: number }) => {
  const name = useSelector(s =>
    Array.get(s.modalityForm.positions, index).pipe(Option.map(_ => _.name)),
  )
  return (
    <View flex={1} p={4}>
      <Input
        placeholder={t('Ex: Goalkeeper')}
        value={name.pipe(Option.getOrElse(() => ''))}
        onChange={t => changeModalityPositionName({ index, value: t })}
        py={Platform.OS === 'ios' ? 12.5 : 6}
        px={Platform.OS === 'ios' ? 8 : 10}
      />
    </View>
  )
}
