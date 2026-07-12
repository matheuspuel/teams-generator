import { Effect, String } from 'effect'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
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
import { useActions, useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { GroupForm } from 'src/state/forms/group'
import { Id } from 'src/utils/Entity'

export default function GroupEditScreen() {
  return (
    <GroupForm.Provider>
      <GroupEditScreen_ />
    </GroupForm.Provider>
  )
}

function GroupEditScreen_() {
  const { groupId } = useLocalSearchParams<{ groupId?: Id }>()
  const appActions = useActions()
  const actions = GroupForm.useActions()
  const runtime = useRuntime()
  const isEnabled = GroupForm.useSelector(_ =>
    String.isNonEmpty(_.name.value.trim()),
  )

  useEffect(() => {
    if (groupId) {
      const group = appActions.groups.key(groupId).get()
      if (!group) return
      actions.setStateFromData(group)
    }
  }, [groupId])

  return (
    <SafeAreaView flex={1} edges={['bottom']}>
      <KeyboardAvoidingView>
        <Stack.Title>{groupId ? t('Edit group') : t('New group')}</Stack.Title>
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
          onPress={() =>
            Effect.gen(function* () {
              const data = yield* actions.validate()
              yield* appActions.saveGroup({ ...data, id: groupId ?? null })
              router.back()
            }).pipe(runtime.runPromiseExit)
          }
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
  const actions = GroupForm.useActions()
  const name = GroupForm.useSelector(_ => _.name)
  return (
    <View p={4}>
      <FormLabel>{t('Name')}</FormLabel>
      <Input
        placeholder={t('Ex: Thursday soccer')}
        value={name.value}
        onChange={actions.name.set}
        autoFocus={true}
      />
    </View>
  )
}

const ModalityField = () => {
  const customModalities = useSelector(_ => _.customModalities)
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
  const actions = GroupForm.useActions()
  const isActive = GroupForm.useSelector(_ => _.modality.value.id === props.id)
  return (
    <Pressable
      key={props.id}
      onPress={() => actions.modality.set(props)}
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
