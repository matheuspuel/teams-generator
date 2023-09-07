import { $, A, F, Rec, Str, Tup } from 'fp'
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
import { memoizedConst, named2 } from 'src/components/helpers'
import { Position, Rating } from 'src/datatypes'
import { appEvents } from 'src/events'
import { Colors } from 'src/services/Theme'
import { PlayerForm } from 'src/slices/playerForm'
import { withOpacity } from 'src/utils/datatypes/Color'
import { RatingSlider } from './components/RatingSlider'

const on = appEvents.player

const ScreenHeader = memoizedConst('Header')(
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
      $(
        Position.Dict,
        Rec.toEntries,
        A.map(Tup.getFirst),
        A.sort(Position.Ord),
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
                  : $(Colors.primary.$5, F.map(withOpacity(63))),
            })([Txt({ size: 18, color: Colors.text.light })(p)]),
          ]),
        ),
      ),
    ),
  ])

export const RatingField = (rating: Rating) =>
  View({ p: 4 })([
    FormLabel()('Habilidade'),
    Txt({ size: 24, weight: 700, color: Colors.primary.$5 })(
      Rating.Show.show(rating),
    ),
    RatingSlider({
      initialPercentage: rating / 10,
      step: 0.05,
      onChange: on.rating.change,
    }),
  ])

export const PlayerView = named2('PlayerForm')(
  ({ form: { name, position, rating } }: { form: PlayerForm }) =>
    Fragment([
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
        isEnabled: Str.isNonEmpty(name),
        p: 16,
        round: 0,
      })([Txt()('Gravar')]),
    ]),
)
