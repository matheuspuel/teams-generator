import { A, F, O, String, pipe } from 'fp'
import {
  Fragment,
  Header,
  Input,
  MaterialIcons,
  Nothing,
  Pressable,
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
import { appEvents } from 'src/events'
import { useSelector } from 'src/hooks/useSelector'
import { Colors } from 'src/services/Theme'
import { getActiveModality } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'
import { withOpacity } from 'src/utils/datatypes/Color'
import { RatingSlider } from './components/RatingSlider'

const on = appEvents.player

export const PlayerView = memoizedConst('PlayerView')(() => {
  const name = useSelector(s => s.playerForm.name)
  return Fragment([
    ScreenHeader,
    ScrollView({
      keyboardShouldPersistTaps: 'always',
      contentContainerStyle: { flexGrow: 1 },
    })([
      View({ flex: 1, p: 4 })([NameField(name), RatingField, PositionField]),
    ]),
    SolidButton({
      onPress: on.save(),
      isEnabled: String.isNonEmpty(name),
      p: 16,
      round: 0,
    })([Txt()('Gravar')]),
  ])
})

const ScreenHeader = memoizedConst('Header')(() =>
  View({ bg: Colors.white })([
    Header({
      title: 'Jogador',
      headerStyle: { backgroundColor: Colors.primary.$5 },
      headerTitleStyle: { color: Colors.text.light },
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
    FormLabel()('Nome'),
    Input({
      placeholder: 'Ex: Pedro',
      value: name,
      onChange: on.name.change,
      autoFocus: true,
    }),
  ])

const RatingField = memoizedConst('RatingField')(() => {
  const rating = useSelector(s => s.playerForm.rating)
  return View({ p: 4 })([
    FormLabel()('Habilidade'),
    Txt({ size: 24, weight: 700, color: Colors.primary.$5 })(
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
      O.map(m => m.positions),
      O.getOrElse(() => A.empty()),
    ),
  )
  return View({ p: 4 })([
    FormLabel()('Posição'),
    View()(A.map(positions, p => PositionItem(p.id))),
  ])
})

const PositionItem = memoized('PositionItem')((id: Id) => {
  const position = useSelector(s =>
    pipe(
      getActiveModality(s),
      O.map(m => m.positions),
      O.flatMap(A.findFirst(_ => _.id === id)),
    ),
  )
  const isActive = useSelector(s => s.playerForm.positionId === id)
  return O.match(position, {
    onNone: () => Nothing,
    onSome: position =>
      Pressable({
        key: position.id,
        onPress: on.position.change(position.id),
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
        Txt({
          w: 50,
          align: 'center',
          size: 20,
          weight: 700,
          color: Colors.primary.$5,
        })(Position.toAbbreviationString(position)),
        Txt({ flex: 1, align: 'center', weight: 500 })(position.name),
      ]),
  })
})
