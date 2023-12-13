import { A, E, O, pipe } from 'fp'
import {
  Header,
  Input,
  KeyboardAvoidingView,
  MaterialIcons,
  Nothing,
  Row,
  SafeAreaView,
  ScrollView,
  Txt,
  TxtContext,
  View,
} from 'src/components'
import { BorderlessButton } from 'src/components/derivative/BorderlessButton'
import { CenterModal } from 'src/components/derivative/CenterModal'
import { FormLabel } from 'src/components/derivative/FormLabel'
import { GhostButton } from 'src/components/derivative/GhostButton'
import { HeaderButton } from 'src/components/derivative/HeaderButton'
import { HeaderButtonRow } from 'src/components/derivative/HeaderButtonRow'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { memoized, memoizedConst, namedConst } from 'src/components/hyperscript'
import { appEvents } from 'src/events'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { getModality } from 'src/slices/groups'
import { validateModalityForm } from 'src/slices/modalityForm'

const on = appEvents.modality

export const ModalityForm = memoizedConst('ModalityForm')(() => {
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
    DeleteModal,
  ])
})

const DeleteModal = namedConst('DeleteModal')(() => {
  const modality = useSelector(s =>
    s.ui.modalDeleteModality
      ? pipe(
          s.modalityForm.id,
          O.flatMap(id => getModality({ _tag: 'CustomModality', id })(s)),
        )
      : O.none(),
  )
  return CenterModal({
    onClose: on.remove.close(),
    visible: O.isSome(modality),
    title: t('Delete modality'),
  })([
    View({ p: 16 })([
      O.match(modality, {
        onNone: () => Nothing,
        onSome: m =>
          TxtContext({ align: 'left' })([
            Txt()(`${t('Want to delete the modality')} `),
            Txt({ weight: 600 })(m.name),
            Txt()(
              `? ${t(
                'The positions of the players of this modality will be lost',
              )}.`,
            ),
          ]),
      }),
    ]),
    View({ borderWidthT: 1, borderColor: Colors.opacity(0.375)(Colors.gray) })(
      [],
    ),
    Row({ p: 16, gap: 8, justify: 'end' })([
      GhostButton({ onPress: on.remove.close(), color: Colors.error })([
        Txt()(t('Cancel')),
      ]),
      SolidButton({ onPress: on.remove.submit(), color: Colors.error })([
        Txt()(t('Delete')),
      ]),
    ]),
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
  Row()([
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
      placeholder: `  ${t('Ex: LD')}  `,
      value: abbreviation.pipe(O.getOrElse(() => '')),
      onChange: t => on.position.abbreviation.change({ index, value: t }),
      autoCapitalize: 'characters',
      align: 'center',
      py: 6,
      px: 10,
    }),
  ])
})

const PositionNameField = memoized('PositionNameField')((index: number) => {
  const name = useSelector(s =>
    A.get(s.modalityForm.positions, index).pipe(O.map(_ => _.name)),
  )
  return View({ flex: 1, p: 4 })([
    Input({
      placeholder: t('Ex: Right Wing'),
      value: name.pipe(O.getOrElse(() => '')),
      onChange: t => on.position.name.change({ index, value: t }),
      py: 6,
      px: 10,
    }),
  ])
})
