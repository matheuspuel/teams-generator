import { get } from '@fp-ts/optic'
import { $, $f, A, Apply, D, O, R, Rec, RIO, S, Str, Tup } from 'fp'
import { not } from 'fp-ts/Predicate'
import { memoizedConst, named2 } from 'src/components/helpers'
import {
  Fragment,
  Header,
  MaterialIcons,
  Pressable,
  Row,
  ScrollView,
  TextInput,
  Txt,
  View,
} from 'src/components/hyperscript'
import { Position, Rating } from 'src/datatypes'
import { root } from 'src/model/Optics'
import { execute, replaceSApp } from 'src/services/StateRef'
import { Colors } from 'src/services/Theme'
import {
  createPlayer,
  deleteCurrentPlayer,
  editPlayer,
} from 'src/slices/groups'
import { PlayerForm } from 'src/slices/playerForm'
import { goBack, onGoBack } from 'src/slices/routes'
import { withOpacity } from 'src/utils/datatypes/Color'
import { RatingSlider } from './components/RatingSlider'

const onChangeName = $f(replaceSApp(root.playerForm.name.$), execute)

const onChangePosition = $f(replaceSApp(root.playerForm.position.$), execute)

const onChangeRating = $f(replaceSApp(root.playerForm.rating.$), execute)

const onSave = $(
  Apply.sequenceS(S.Apply)({
    form: $(
      S.gets(get(root.playerForm.$)),
      S.map(O.fromPredicate(not(f => Str.isEmpty(f.name)))),
    ),
    groupId: S.gets(get(root.ui.selectedGroupId.$)),
    playerId: $(S.gets(get(root.ui.selectedPlayerId.$)), S.map(O.some)),
  }),
  S.map(Apply.sequenceS(O.Apply)),
  execute,
  RIO.chain(
    O.matchW(
      () => RIO.of(undefined),
      ({ form, groupId, playerId }) =>
        $(
          playerId,
          O.matchW(
            () => createPlayer({ groupId, player: form }),
            id => execute(editPlayer({ groupId, player: { ...form, id } })),
          ),
          RIO.apFirst(onGoBack),
        ),
    ),
  ),
)

const onDelete = $(deleteCurrentPlayer, S.apFirst(goBack), execute)

const ScreenHeader = memoizedConst('Header')(
  View({ bg: Colors.white })([
    Header({
      title: 'Jogador',
      headerStyle: { backgroundColor: Colors.primary.$5 },
      headerTitleStyle: { color: Colors.text.light },
      headerLeft: Pressable({
        onPress: onGoBack,
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
        onPress: onDelete,
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
    TextInput({
      autoFocus: true,
      placeholder: 'Ex: Pedro',
      placeholderTextColor: Colors.gray.$3,
      value: name,
      onChange: onChangeName,
      cursorColor: Colors.text.dark,
      fontSize: 12,
      p: 8,
      px: 14,
      borderWidth: 1,
      round: 4,
      borderColor: Colors.gray.$2,
      focused: {
        bg: $(Colors.primary.$5, R.map(withOpacity(31))),
        borderColor: Colors.primary.$5,
      },
    }),
  ])

const PositionField = (position: Position) =>
  View({ p: 4 })([
    Txt({ weight: 500, color: Colors.gray.$4, my: 4 })('Posição'),
    Row({ justify: 'space-evenly' })(
      $(
        Position.Dict,
        Rec.toEntries,
        A.map(Tup.fst),
        A.sort(Position.Ord),
        A.map(p =>
          Pressable({
            key: p,
            onPress: onChangePosition(p),
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
      onChange: $f(
        v => Math.round(v * 20) / 2,
        D.decodeOption(Rating.Schema),
        O.map(onChangeRating),
        O.getOrElseW(() => RIO.of(undefined)),
      ),
    }),
  ])

const SaveButton = ({ isEnabled }: { isEnabled: boolean }) =>
  Pressable({
    p: 16,
    bg: isEnabled
      ? Colors.primary.$5
      : $(Colors.primary.$5, R.map(withOpacity(95))),
    onPress: onSave,
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
