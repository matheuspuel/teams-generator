import { A, E, O } from 'fp'
import { Platform } from 'react-native'
import {
  Header,
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
import { HeaderButton } from 'src/components/derivative/HeaderButton'
import { HeaderButtonRow } from 'src/components/derivative/HeaderButtonRow'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { memoized, memoizedConst } from 'src/components/hyperscript'
import { appEvents } from 'src/events'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { validateModalityForm } from 'src/slices/modalityForm'

const on = appEvents.modality

export const ModalityFormView = memoizedConst('ModalityFormView')(() => {
  const isEnabled = useSelector(s =>
    E.isRight(validateModalityForm(s.modalityForm)),
  )
  return SafeAreaView({ flex: 1, edges: ['bottom'] })([
    KeyboardAvoidingView()([
      ScreenHeader,
      ScrollView({
        keyboardShouldPersistTaps: 'always',
        contentContainerStyle: { flexGrow: 1 },
      })([View({ flex: 1, p: 4 })([NameField, PositionsField])]),
      SolidButton({
        onPress: on.submit(),
        isEnabled: isEnabled,
        p: 16,
        round: 0,
        color: Colors.header,
      })([Txt()(t('Save'))]),
    ]),
  ])
})

const ScreenHeader = memoizedConst('Header')(() => {
  const isEdit = useSelector(s => O.isSome(s.modalityForm.id))
  return View()([
    Header({
      title: isEdit ? t('Edit modality') : t('New modality'),
      headerLeft: HeaderButtonRow([
        HeaderButton({
          onPress: appEvents.back(),
          icon: MaterialIcons({ name: 'arrow-back' }),
        }),
      ]),
      headerRight: HeaderButtonRow([
        HeaderButton({
          onPress: on.remove.open(),
          icon: MaterialIcons({ name: 'delete' }),
        }),
      ]),
    }),
  ])
})

const NameField = memoizedConst('NameField')(() => {
  const name = useSelector(s => s.modalityForm.name)
  return View({ p: 4 })([
    FormLabel()(t('Name')),
    Input({
      placeholder: t('Ex: Soccer'),
      value: name,
      onChange: on.name.change,
      autoFocus: true,
    }),
  ])
})

const PositionsField = memoizedConst('PositionsField')(() => {
  const positionCount = useSelector(s => s.modalityForm.positions.length)
  return View({ p: 4 })([
    FormLabel()(t('Positions')),
    Row({ p: 4 })([
      View({ w: 90 })([FormLabel({ size: 12 })(t('Abbreviation'))]),
      View()([FormLabel({ size: 12 })(t('Name'))]),
    ]),
    View()(A.map(A.replicate(positionCount)(null), (_, i) => PositionItem(i))),
    GhostButton({ onPress: on.position.add(), alignSelf: 'center' })([
      Row({ align: 'center' })([
        MaterialIcons({ name: 'add' }),
        Txt()(t('New position')),
      ]),
    ]),
  ])
})

const PositionItem = memoized('PositionItem')((index: number) =>
  Row({ align: 'center' })([
    PositionAbbreviationField(index),
    PositionNameField(index),
    BorderlessButton({ onPress: on.position.lift(index) })([
      MaterialIcons({ name: 'keyboard-arrow-up' }),
    ]),
    BorderlessButton({
      onPress: on.position.remove(index),
      color: Colors.error,
    })([MaterialIcons({ name: 'delete' })]),
  ]),
)

const PositionAbbreviationField = memoized('PositionAbbreviationField')((
  index: number,
) => {
  const abbreviation = useSelector(s =>
    A.get(s.modalityForm.positions, index).pipe(O.map(_ => _.abbreviation)),
  )
  return View({ p: 4 })([
    Input({
      placeholder: t('Ex: GK'),
      w: 82,
      value: abbreviation.pipe(O.getOrElse(() => '')),
      onChange: t => on.position.abbreviation.change({ index, value: t }),
      autoCapitalize: 'characters',
      align: 'center',
      py: Platform.OS === 'ios' ? 12.5 : 6,
      px: Platform.OS === 'ios' ? 8 : 10,
    }),
  ])
})

const PositionNameField = memoized('PositionNameField')((index: number) => {
  const name = useSelector(s =>
    A.get(s.modalityForm.positions, index).pipe(O.map(_ => _.name)),
  )
  return View({ flex: 1, p: 4 })([
    Input({
      placeholder: t('Ex: Goalkeeper'),
      value: name.pipe(O.getOrElse(() => '')),
      onChange: t => on.position.name.change({ index, value: t }),
      py: Platform.OS === 'ios' ? 12.5 : 6,
      px: Platform.OS === 'ios' ? 8 : 10,
    }),
  ])
})
