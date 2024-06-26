import { Array, Option, String } from 'effect'
import {
  Header,
  Input,
  KeyboardAvoidingView,
  MaterialIcons,
  Nothing,
  Pressable,
  Row,
  SafeAreaView,
  ScrollView,
  Txt,
  View,
} from 'src/components'
import { FormLabel } from 'src/components/derivative/FormLabel'
import { GhostButton } from 'src/components/derivative/GhostButton'
import { HeaderButton } from 'src/components/derivative/HeaderButton'
import { HeaderButtonRow } from 'src/components/derivative/HeaderButtonRow'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { memoizedConst, named } from 'src/components/hyperscript'
import { Modality } from 'src/datatypes'
import { staticModalities } from 'src/datatypes/Modality'
import { back } from 'src/events/core'
import {
  changeGroupModality,
  changeGroupName,
  saveGroup,
} from 'src/events/groups'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { StateRef } from 'src/services/StateRef'
import { Colors } from 'src/services/Theme'
import { Route, navigate } from 'src/slices/routes'

export const GroupFormView = memoizedConst('GroupFormView')(() => {
  const isEnabled = useSelector(s => String.isNonEmpty(s.groupForm.name.trim()))
  return SafeAreaView({ flex: 1, edges: ['bottom'] })([
    KeyboardAvoidingView()([
      ScreenHeader,
      ScrollView({
        keyboardShouldPersistTaps: 'always',
        contentContainerStyle: { flexGrow: 1 },
      })([View({ flex: 1, p: 4 })([NameField, ModalityField])]),
      SolidButton({
        onPress: saveGroup,
        isEnabled: isEnabled,
        p: 16,
        round: 0,
        color: Colors.header,
      })([Txt()(t('Save'))]),
    ]),
  ])
})

const ScreenHeader = memoizedConst('Header')(() => {
  const isEdit = useSelector(s => Option.isSome(s.groupForm.id))
  return View()([
    Header({
      title: isEdit ? t('Edit group') : t('New group'),
      headerLeft: HeaderButtonRow([
        HeaderButton({
          onPress: back,
          icon: MaterialIcons({ name: 'arrow-back' }),
        }),
      ]),
    }),
  ])
})

const NameField = memoizedConst('NameField')(() => {
  const name = useSelector(s => s.groupForm.name)
  return View({ p: 4 })([
    FormLabel()(t('Name')),
    Input({
      placeholder: t('Ex: Thursday soccer'),
      value: name,
      onChange: changeGroupName,
      autoFocus: true,
    }),
  ])
})

const ModalityField = memoizedConst('ModalityField')(() => {
  const customModalities = useSelector(s => s.customModalities)
  const modalities = [...customModalities, ...staticModalities]
  return View({ p: 4 })([
    Row({ justify: 'space-between', align: 'center' })([
      FormLabel()(t('Modality/Sport')),
      GhostButton({
        onPress: StateRef.execute(navigate(Route.Modalities())),
        alignSelf: 'center',
      })([
        Row({ align: 'center', gap: 8 })([
          MaterialIcons({ name: 'edit', size: 16 }),
          Txt({ size: 12 })(t('Edit modalities')),
        ]),
      ]),
    ]),
    View()(Array.map(modalities, m => ModalityItem(m))),
  ])
})

const ModalityItem = named('ModalityItem')((props: Modality) => {
  const isActive = useSelector(s => s.groupForm.modality.id === props.id)
  return Pressable({
    key: props.id,
    onPress: changeGroupModality(props),
    py: 4,
    px: 12,
    round: 8,
    align: 'center',
    direction: 'row',
    bg: isActive ? Colors.opacity(0.125)(Colors.primary) : undefined,
    rippleColor: Colors.opacity(0.125)(Colors.primary),
    rippleOpacity: 0.1,
  })([
    View({ w: 50 })([
      isActive
        ? MaterialIcons({ name: 'check', color: Colors.primary })
        : Nothing,
    ]),
    Txt({ flex: 1, align: 'center', p: 8, size: 16, weight: 500 })(props.name),
    View({ w: 50 })([]),
  ])
})
