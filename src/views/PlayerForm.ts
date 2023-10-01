import { A, F, Record, String, Tuple, pipe } from 'fp'
import {
  Fragment,
  Header,
  Input,
  MaterialIcons,
  Pressable,
  Row,
  ScrollView,
  Txt,
  View,
} from 'src/components'
import { FormLabel } from 'src/components/derivative/FormLabel'
import { HeaderButton } from 'src/components/derivative/HeaderButton'
import { HeaderButtonRow } from 'src/components/derivative/HeaderButtonRow'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { memoizedConst } from 'src/components/helpers'
import { Position, Rating } from 'src/datatypes'
import { appEvents } from 'src/events'
import { useSelector } from 'src/hooks/useSelector'
import { Colors } from 'src/services/Theme'
import { withOpacity } from 'src/utils/datatypes/Color'
import { RatingSlider } from './components/RatingSlider'

const on = appEvents.player

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

const PositionField = (position: Position) =>
  View({ p: 4 })([
    FormLabel()('Posição'),
    Row({ justify: 'space-evenly' })(
      pipe(
        Position.Dict,
        Record.toEntries,
        A.map(Tuple.getFirst),
        A.sort(Position.Order),
        A.map(p =>
          Pressable({
            key: p,
            onPress: on.position.change(p),
            p: 12,
            align: 'center',
            borderless: true,
            rippleColor: Colors.primary.$5,
            rippleOpacity: 0.15,
          })([
            View({
              aspectRatio: 1,
              justify: 'center',
              p: 4,
              round: 9999,
              bg:
                position === p
                  ? Colors.primary.$5
                  : F.map(Colors.primary.$5, withOpacity(63)),
            })([Txt({ size: 18, color: Colors.text.light })(p)]),
          ]),
        ),
      ),
    ),
  ])

const RatingField = (rating: Rating) =>
  View({ p: 4 })([
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

export const PlayerView = memoizedConst('PlayerView')(() => {
  const { name, position, rating } = useSelector(s => s.playerForm)
  return Fragment([
    ScreenHeader,
    ScrollView({
      keyboardShouldPersistTaps: 'always',
      contentContainerStyle: { flexGrow: 1 },
    })([
      View({ flex: 1, p: 4 })([
        NameField(name),
        PositionField(position),
        RatingField(rating),
      ]),
    ]),
    SolidButton({
      onPress: on.save(),
      isEnabled: String.isNonEmpty(name),
      p: 16,
      round: 0,
    })([Txt()('Gravar')]),
  ])
})
