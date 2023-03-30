import { get } from '@fp-ts/optic'
import { $, $f, A, Apply, O, R, RA, Rec, RIO, S, Str, Tup } from 'fp'
import { not } from 'fp-ts/Predicate'
import { memoizedConst } from 'src/components/helpers'
import {
  Header,
  MaterialIcons,
  Pressable,
  Row,
  ScrollView,
  TextInput,
  Txt,
  View,
} from 'src/components/hyperscript2'
import { RatingList, RatingShow } from 'src/datatypes/Player'
import { PositionDict, PositionOrd } from 'src/datatypes/Position'
import { execute, replaceSApp } from 'src/services/Store'
import { Colors } from 'src/services/Theme'
import {
  createPlayer,
  deleteCurrentPlayer,
  editPlayer,
} from 'src/slices/groups'
import { PlayerForm, PlayerFormLens } from 'src/slices/playerForm'
import { goBack } from 'src/slices/routes'
import { UiLens } from 'src/slices/ui'
import { withOpacity } from 'src/utils/datatypes/Color'

const onChangeName = $f(replaceSApp(PlayerFormLens.at('name')), execute)

const onChangePosition = $f(replaceSApp(PlayerFormLens.at('position')), execute)

const onChangeRating = $f(replaceSApp(PlayerFormLens.at('rating')), execute)

const onSave = $(
  Apply.sequenceS(S.Apply)({
    form: $(
      S.gets(get(PlayerFormLens)),
      S.map(O.fromPredicate(not(f => Str.isEmpty(f.name)))),
    ),
    groupId: S.gets(get(UiLens.at('selectedGroupId'))),
    playerId: $(S.gets(get(UiLens.at('selectedPlayerId'))), S.map(O.some)),
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
          RIO.apFirst(goBack),
        ),
    ),
  ),
)

const onDelete = $(deleteCurrentPlayer, RIO.apFirst(goBack))

const ScreenHeader = memoizedConst('Header')(
  View({ bg: Colors.white })([
    Header({
      title: 'Jogador',
      headerStyle: { backgroundColor: Colors.primary.$5 },
      headerTitleStyle: { color: Colors.text.light },
      headerLeft: Pressable({
        onPress: goBack,
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

export const PlayerView = ({
  form: { name, position, rating },
}: {
  form: PlayerForm
}) =>
  ScrollView({
    keyboardShouldPersistTaps: 'handled',
    contentContainerStyle: { flexGrow: 1 },
  })([
    ScreenHeader,
    View({ flex: 1, p: 4 })([
      View({ p: 4 })([
        Txt({ weight: 500, color: Colors.gray.$4, my: 4 })('Nome'),
        TextInput({
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
      ]),
      View({ p: 4 })([
        Txt({ weight: 500, color: Colors.gray.$4, my: 4 })('Posição'),
        Row({ justify: 'space-evenly' })(
          $(
            PositionDict,
            Rec.toEntries,
            A.map(Tup.fst),
            A.sort(PositionOrd),
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
                  Txt({ size: 14, align: 'center', color: Colors.text.light })(
                    p,
                  ),
                ]),
              ]),
            ),
          ),
        ),
      ]),
      View({ p: 4 })([
        Txt({ weight: 500, color: Colors.gray.$4, my: 4 })('Habilidade'),
        Txt({
          align: 'center',
          size: 24,
          weight: 700,
          color: Colors.primary.$5,
        })(RatingShow.show(rating)),
        Row()(
          $(
            RatingList,
            RA.map(r =>
              View({ key: r.toString(), flex: 1, h: 30 })(
                rating === r
                  ? [
                      View({
                        alignSelf: 'center',
                        w: 200,
                        absolute: { bottom: -15 },
                      })([
                        MaterialIcons({
                          name: 'arrow-drop-down',
                          size: 60,
                          align: 'center',
                          color: Colors.primary.$5,
                        }),
                      ]),
                    ]
                  : [],
              ),
            ),
          ),
        ),
        Row()(
          $(
            RatingList,
            RA.map(r =>
              View({ key: r.toString(), flex: 1 })([
                View({ align: 'center' })([
                  View({
                    mb: -1,
                    mt: r % 1 === 0 ? 0 : 4,
                    h: r % 1 === 0 ? 9 : 5,
                    w: 4,
                    bg: Colors.primary.$4,
                    round: 10,
                    roundB: 0,
                  })([]),
                  ...(r % 1 === 0
                    ? [
                        View({ absolute: { top: 10 } })([
                          Txt({
                            align: 'center',
                            size: 12,
                            color: Colors.primary.$4,
                            weight: 900,
                            w: 100,
                          })(r.toString()),
                        ]),
                      ]
                    : []),
                ]),
              ]),
            ),
          ),
        ),
        View({ h: 4, bg: Colors.primary.$4, round: 10 })([]),
        Row()(
          $(
            RatingList,
            RA.map(r =>
              View({ key: r.toString(), flex: 1 })([
                Pressable({ h: 70, mt: -35, onPress: onChangeRating(r) })([]),
              ]),
            ),
          ),
        ),
      ]),
    ]),
    Pressable({
      p: 16,
      bg: !name
        ? $(Colors.primary.$5, R.map(withOpacity(95)))
        : Colors.primary.$5,
      onPress: onSave,
      rippleColor: Colors.black,
      rippleOpacity: 0.5,
    })([
      Txt({
        align: 'center',
        color: !name ? $(Colors.white, R.map(withOpacity(95))) : Colors.white,
      })('Gravar'),
    ]),
  ])
