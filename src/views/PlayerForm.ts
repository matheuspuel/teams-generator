import { $, A, R, Rec, Tup } from 'fp'
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
      headerLeft: Pressable({
        onPress: appEvents.back(),
        ml: 4,
        p: 8,
        borderless: true,
        foreground: true,
      })([
        MaterialIcons({
          name: 'arrow-back',
          color: Colors.text.light,
          size: 24,
        }),
      ]),
      headerRight: Pressable({
        onPress: on.delete(),
        mr: 4,
        p: 8,
        borderless: true,
        foreground: true,
      })([
        MaterialIcons({ name: 'delete', color: Colors.text.light, size: 24 }),
      ]),
    }),
  ]),
)

const NameField = (name: string) =>
  View({ p: 4 })([
    Txt({ weight: 500, color: Colors.gray.$4, my: 4 })('Nome'),
    Input({
      placeholder: 'Ex: Pedro',
      value: name,
      onChange: on.name.change,
      autoFocus: true,
    }),
  ])

const PositionField = (position: Position) =>
  View({ p: 4 })([
    Txt({ weight: 500, color: Colors.gray.$4, my: 4 })('Posição'),
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
                  : $(Colors.primary.$5, R.map(withOpacity(63))),
            })([
              Txt({ size: 18, align: 'center', color: Colors.text.light })(p),
            ]),
          ]),
        ),
      ),
    ),
  ])

export const RatingField = (rating: Rating) =>
  View({ p: 4 })([
    Txt({ weight: 500, color: Colors.gray.$4, my: 4 })('Habilidade'),
    Txt({
      align: 'center',
      size: 24,
      weight: 700,
      color: Colors.primary.$5,
    })(Rating.Show.show(rating)),
    RatingSlider({
      initialPercentage: rating / 10,
      step: 0.05,
      onChange: on.rating.change,
    }),
  ])

const SaveButton = ({ isEnabled }: { isEnabled: boolean }) =>
  Pressable({
    p: 16,
    bg: isEnabled
      ? Colors.primary.$5
      : $(Colors.primary.$5, R.map(withOpacity(95))),
    onPress: on.save(),
    isEnabled: isEnabled,
    rippleColor: Colors.black,
    rippleOpacity: 0.5,
  })([
    Txt({
      align: 'center',
      color: isEnabled ? Colors.white : $(Colors.white, R.map(withOpacity(95))),
    })('Gravar'),
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
      SaveButton({ isEnabled: !!name }),
    ]),
)
