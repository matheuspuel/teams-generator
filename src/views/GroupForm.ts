import { A, F, O, String } from 'fp'
import {
  Fragment,
  Header,
  Input,
  MaterialIcons,
  Nothing,
  Pressable,
  Row,
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
import { appEvents } from 'src/events'
import { useSelector } from 'src/hooks/useSelector'
import { Colors } from 'src/services/Theme'
import { withOpacity } from 'src/utils/datatypes/Color'

const on = appEvents.groups.item

export const GroupForm = memoizedConst('GroupForm')(() => {
  const isEnabled = useSelector(s => String.isNonEmpty(s.groupForm.name))
  return Fragment([
    ScreenHeader,
    ScrollView({
      keyboardShouldPersistTaps: 'always',
      contentContainerStyle: { flexGrow: 1 },
    })([View({ flex: 1, p: 4 })([NameField, ModalityField])]),
    SolidButton({
      onPress: on.upsert.submit(),
      isEnabled: isEnabled,
      p: 16,
      round: 0,
    })([Txt()('Gravar')]),
  ])
})

const ScreenHeader = memoizedConst('Header')(() => {
  const isEdit = useSelector(s => O.isSome(s.groupForm.id))
  return View({ bg: Colors.white })([
    Header({
      title: isEdit ? 'Editar grupo' : 'Novo grupo',
      headerStyle: { backgroundColor: Colors.primary.$5 },
      headerTitleStyle: { color: Colors.text.light },
      headerLeft: HeaderButtonRow([
        HeaderButton({
          onPress: appEvents.back(),
          icon: MaterialIcons({ name: 'arrow-back' }),
        }),
      ]),
    }),
  ])
})

const NameField = memoizedConst('NameField')(() => {
  const name = useSelector(s => s.groupForm.name)
  return View({ p: 4 })([
    FormLabel()('Nome'),
    Input({
      placeholder: 'Ex: Futebol de quinta',
      value: name,
      onChange: on.upsert.form.name.change,
      autoFocus: true,
    }),
  ])
})

const ModalityField = memoizedConst('ModalityField')(() => {
  const customModalities = useSelector(s => s.customModalities)
  const modalities = [...customModalities, ...staticModalities]
  return View({ p: 4 })([
    Row({ justify: 'space-between', align: 'center' })([
      FormLabel()('Modalidade/Esporte'),
      GhostButton({ onPress: appEvents.modality.go(), alignSelf: 'center' })([
        Row({ align: 'center', gap: 8 })([
          MaterialIcons({ name: 'edit', size: 16 }),
          Txt({ size: 12 })('Editar modalidades'),
        ]),
      ]),
    ]),
    View()(A.map(modalities, m => ModalityItem(m))),
  ])
})

const ModalityItem = named('ModalityItem')((props: Modality) => {
  const isActive = useSelector(s => s.groupForm.modality.id === props.id)
  return Pressable({
    key: props.id,
    onPress: on.upsert.form.modality.change(props),
    py: 4,
    px: 12,
    round: 8,
    align: 'center',
    direction: 'row',
    bg: isActive ? F.map(Colors.primary.$5, withOpacity(31)) : undefined,
    rippleColor: F.map(Colors.primary.$5, withOpacity(31)),
    rippleOpacity: 0.1,
  })([
    View({ w: 50 })([
      isActive
        ? MaterialIcons({ name: 'check', color: Colors.primary.$5 })
        : Nothing,
    ]),
    Txt({ flex: 1, align: 'center', p: 8, size: 16, weight: 500 })(props.name),
    View({ w: 50 })([]),
  ])
})
