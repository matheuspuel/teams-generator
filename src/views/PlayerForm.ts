import { Option, ReadonlyArray, String, pipe } from 'effect'
import {
  Header,
  Input,
  KeyboardAvoidingView,
  MaterialIcons,
  Nothing,
  Pressable,
  SafeAreaView,
  ScrollView,
  Txt,
  View,
} from 'src/components'
import { FormLabel } from 'src/components/derivative/FormLabel'
import { HeaderButton } from 'src/components/derivative/HeaderButton'
import { HeaderButtonRow } from 'src/components/derivative/HeaderButtonRow'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { memoized, memoizedConst } from 'src/components/hyperscript'
import { Position, Rating } from 'src/datatypes'
import { Abbreviation } from 'src/datatypes/Position'
import { appEvents } from 'src/events'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { getActiveModality } from 'src/slices/groups'
import { RatingSlider } from './components/RatingSlider'

const on = appEvents.player

export const PlayerView = memoizedConst('PlayerView')(() => {
  const name = useSelector(s => s.playerForm.name)
  return SafeAreaView({ flex: 1, edges: ['bottom'] })([
    KeyboardAvoidingView()([
      ScreenHeader,
      ScrollView({
        keyboardShouldPersistTaps: 'always',
        contentContainerStyle: { flexGrow: 1 },
      })([
        View({ flex: 1, p: 4 })([NameField(name), RatingField, PositionField]),
      ]),
      SolidButton({
        onPress: on.save(),
        isEnabled: String.isNonEmpty(name.trim()),
        p: 16,
        round: 0,
        color: Colors.header,
      })([Txt()(t('Save'))]),
    ]),
  ])
})

const ScreenHeader = memoizedConst('Header')(() =>
  View()([
    Header({
      title: t('Player'),
      headerLeft: HeaderButtonRow([
        HeaderButton({
          onPress: appEvents.back(),
          icon: MaterialIcons({ name: 'arrow-back' }),
        }),
      ]),
      headerRight: HeaderButtonRow([
        HeaderButton({
          onPress: on.delete(),
          icon: MaterialIcons({ name: 'delete' }),
        }),
      ]),
    }),
  ]),
)

const NameField = (name: string) =>
  View({ p: 4 })([
    FormLabel()(t('Name')),
    Input({
      placeholder: t('Ex: Jack'),
      value: name,
      onChange: on.name.change,
      autoFocus: true,
    }),
  ])

const RatingField = memoizedConst('RatingField')(() => {
  const rating = useSelector(s => s.playerForm.rating)
  return View({ p: 4 })([
    FormLabel()(t('Rating')),
    Txt({ size: 24, weight: 700, color: Colors.primary })(
      Rating.toString(rating),
    ),
    RatingSlider({
      initialPercentage: rating / 10,
      step: 0.05,
      onChange: on.rating.change,
    }),
  ])
})

const PositionField = memoizedConst('PositionField')(() => {
  const positions = useSelector(s =>
    pipe(
      getActiveModality(s),
      Option.map(m => m.positions),
      Option.getOrElse(() => ReadonlyArray.empty()),
    ),
  )
  return View({ p: 4 })([
    FormLabel()(t('Position')),
    View()(ReadonlyArray.map(positions, p => PositionItem(p.abbreviation))),
  ])
})

const PositionItem = memoized('PositionItem')((abbreviation: Abbreviation) => {
  const position = useSelector(s =>
    pipe(
      getActiveModality(s),
      Option.flatMap(m =>
        ReadonlyArray.findFirst(
          m.positions,
          _ => _.abbreviation === abbreviation,
        ),
      ),
    ),
  )
  const isActive = useSelector(
    s => s.playerForm.positionAbbreviation === abbreviation,
  )
  return Option.match(position, {
    onNone: () => Nothing,
    onSome: position =>
      Pressable({
        key: position.abbreviation,
        onPress: on.position.change(position.abbreviation),
        py: 4,
        px: 12,
        round: 8,
        align: 'center',
        direction: 'row',
        bg: isActive ? Colors.opacity(0.125)(Colors.primary) : undefined,
        rippleColor: Colors.primary,
        rippleOpacity: 0.1,
      })([
        View({ w: 30 })([
          isActive
            ? MaterialIcons({ name: 'check', color: Colors.primary })
            : Nothing,
        ]),
        View({ minW: 70, align: 'center' })([
          View({
            p: 4,
            round: 12,
            bg: Colors.opacity(0.5)(Colors.primary),
            minW: 35,
          })([
            Txt({
              align: 'center',
              size: 18,
              weight: 600,
              includeFontPadding: false,
            })(Position.toAbbreviationString(position)),
          ]),
        ]),
        Txt({ flex: 1, align: 'center', weight: 500 })(position.name),
      ]),
  })
})
