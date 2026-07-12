import DeleteIcon from '@expo/material-symbols/delete.xml'
import { Array, Effect } from 'effect'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
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
import { useActions } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { runtime } from 'src/runtime'
import { Colors } from 'src/services/Theme'
import { ModalityForm } from 'src/state/forms/modality'
import { Id } from 'src/utils/Entity'

export default function ModalityScreen() {
  return (
    <ModalityForm.Provider>
      <ModalityScreen_ />
    </ModalityForm.Provider>
  )
}

function ModalityScreen_() {
  const { modalityId } = useLocalSearchParams<{ modalityId?: Id }>()
  const appActions = useActions()
  const actions = ModalityForm.useActions()

  useEffect(() => {
    if (modalityId) {
      const modality = appActions.getModality({
        _tag: 'CustomModality',
        id: modalityId,
      })
      if (!modality) return
      actions.setStateFromData(modality)
    } else {
      actions.positions.addItem()
    }
  }, [modalityId, actions])

  return (
    <SafeAreaView flex={1} edges={['bottom']}>
      <KeyboardAvoidingView>
        <Stack.Title>
          {modalityId ? t('Edit modality') : t('New modality')}
        </Stack.Title>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            onPress={() =>
              modalityId
                ? router.navigate(`/modalities/${modalityId}/delete`)
                : router.back()
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
          onPress={() =>
            Effect.gen(function* () {
              const data = yield* actions.validate()
              yield* appActions.saveModality({
                ...data,
                id: modalityId ?? null,
              })
              router.back()
            }).pipe(runtime.runPromiseExit)
          }
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
  const actions = ModalityForm.useActions()
  const name = ModalityForm.useSelector(_ => _.name)
  return (
    <View p={4}>
      <FormLabel>{t('Name')}</FormLabel>
      <Input
        placeholder={t('Ex: Soccer')}
        value={name.value}
        onChange={actions.name.set}
        autoFocus={true}
      />
    </View>
  )
}

const PositionsField = () => {
  const actions = ModalityForm.useActions()
  const positionCount = ModalityForm.useSelector(_ => _.positions.length)
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
      <GhostButton onPress={actions.positions.addItem} alignSelf="center">
        <Row align="center">
          <MaterialIcons name="add" />
          <Txt>{t('New position')}</Txt>
        </Row>
      </GhostButton>
    </View>
  )
}

const PositionItem = ({ index }: { index: number }) => {
  const actions = ModalityForm.useActions()
  return (
    <Row align="center">
      <PositionAbbreviationField index={index} />
      <PositionNameField index={index} />
      <BorderlessButton onPress={() => actions.positions.moveUp(index)}>
        <MaterialIcons name="keyboard-arrow-up" />
      </BorderlessButton>
      <BorderlessButton
        onPress={() => actions.positions.removeItemKeepingAtLeastOne(index)}
        color={Colors.error}
      >
        <MaterialIcons name="delete" />
      </BorderlessButton>
    </Row>
  )
}

const PositionAbbreviationField = ({ index }: { index: number }) => {
  const actions = ModalityForm.useActions()
  const abbreviation = ModalityForm.useSelector(
    _ => _.positions[index]?.abbreviation.value,
  )
  return (
    <View p={4}>
      <Input
        placeholder={t('Ex: GK')}
        w={82}
        value={abbreviation ?? ''}
        onChange={t =>
          actions.positions
            .index(index)
            .abbreviation.set(t.slice(0, 3).toUpperCase())
        }
        autoCapitalize="characters"
        align="center"
        py={Platform.OS === 'ios' ? 12.5 : 6}
        px={Platform.OS === 'ios' ? 8 : 10}
      />
    </View>
  )
}

const PositionNameField = ({ index }: { index: number }) => {
  const actions = ModalityForm.useActions()
  const name = ModalityForm.useSelector(_ => _.positions[index]?.name.value)
  return (
    <View flex={1} p={4}>
      <Input
        placeholder={t('Ex: Goalkeeper')}
        value={name ?? ''}
        onChange={t => actions.positions.index(index).name.set(t)}
        py={Platform.OS === 'ios' ? 12.5 : 6}
        px={Platform.OS === 'ios' ? 8 : 10}
      />
    </View>
  )
}
