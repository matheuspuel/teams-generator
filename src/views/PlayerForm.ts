import { get } from '@fp-ts/optic'
import { $, $f, A, Apply, O, RA, Rec, RIO, S, Str, Tup } from 'fp'
import { not } from 'fp-ts/Predicate'
import { memoizedConst } from 'src/components/helpers'
import { ScrollView } from 'src/components/hyperscript/reactNative'
import { Input } from 'src/components/util-props/basic/Input'
import { Pressable } from 'src/components/util-props/basic/Pressable'
import { Row } from 'src/components/util-props/basic/Row'
import { Txt } from 'src/components/util-props/basic/Txt'
import { View } from 'src/components/util-props/basic/View'
import { MaterialIcons } from 'src/components/util-props/icons/MaterialIcons'
import { Header } from 'src/components/util-props/react-navigation/Header'
import { HeaderBackButton } from 'src/components/util-props/react-navigation/HeaderBackButton'
import { RatingList, RatingShow } from 'src/datatypes/Player'
import { PositionDict, PositionOrd } from 'src/datatypes/Position'
import { execute, replaceSApp } from 'src/services/Store'
import {
  createPlayer,
  deleteCurrentPlayer,
  editPlayer,
} from 'src/slices/groups'
import { PlayerForm, PlayerFormLens } from 'src/slices/playerForm'
import { goBack } from 'src/slices/routes'
import { UiLens } from 'src/slices/ui'
import { colors } from 'src/theme'
import { shade, withOpacity } from 'src/utils/datatypes/Color'

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
        Txt({ weight: 500, color: colors.gray.$4, my: 4 })('Nome'),
        Input({
          placeholder: 'Ex: Pedro',
          placeholderTextColor: colors.gray.$3,
          value: name,
          onChange: onChangeName,
          cursorColor: colors.darkText,
          fontSize: 12,
          p: 8,
          px: 14,
          borderWidth: 1,
          round: 4,
          borderColor: colors.gray.$2,
          focused: {
            bg: withOpacity(31)(colors.primary.$5),
            borderColor: colors.primary.$5,
          },
        }),
      ]),
      View({ p: 4 })([
        Txt({ weight: 500, color: colors.gray.$4, my: 4 })('Posição'),
        Row()(
          $(
            PositionDict,
            Rec.toEntries,
            A.map(Tup.fst),
            A.sort(PositionOrd),
            A.map(p =>
              Pressable({
                key: p,
                flex: 1,
                align: 'center',
                onPress: onChangePosition(p),
              })([
                View({
                  aspectRatio: 1,
                  justify: 'center',
                  p: 4,
                  round: 9999,
                  bg:
                    position === p
                      ? colors.primary.$5
                      : withOpacity(63)(colors.primary.$5),
                })([
                  Txt({ size: 14, align: 'center', color: colors.lightText })(
                    p,
                  ),
                ]),
              ]),
            ),
          ),
        ),
      ]),
      View({ p: 4 })([
        Txt({ weight: 500, color: colors.gray.$4, my: 4 })('Habilidade'),
        Txt({
          align: 'center',
          size: 24,
          weight: 700,
          color: colors.primary.$5,
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
                          color: colors.primary.$5,
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
                    bg: colors.primary.$4,
                    round: 10,
                    roundB: 0,
                  })([]),
                  ...(r % 1 === 0
                    ? [
                        View({ absolute: { top: 10 } })([
                          Txt({
                            align: 'center',
                            size: 12,
                            color: colors.primary.$4,
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
        View({ h: 4, bg: colors.primary.$4, round: 10 })([]),
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
      p: 12,
      bg: !name ? withOpacity(95)(colors.primary.$5) : colors.primary.$5,
      pressed: { bg: name ? shade(0.4)(colors.primary.$5) : undefined },
      onPress: onSave,
    })([
      Txt({
        align: 'center',
        color: !name ? withOpacity(95)(colors.white) : colors.white,
      })('Gravar'),
    ]),
  ])

const ScreenHeader = memoizedConst('Header')(
  View({ bg: colors.white })([
    Header({
      title: 'Jogador',
      headerStyle: { backgroundColor: colors.primary.$5 },
      headerTitleStyle: { color: colors.lightText },
      headerLeft: HeaderBackButton({
        onPress: goBack,
        tintColor: colors.lightText,
      }),
      headerRight: Pressable({
        mr: 4,
        p: 8,
        round: 100,
        pressed: { bg: withOpacity(47)(colors.black) },
        onPress: onDelete,
      })([
        MaterialIcons({
          name: 'delete',
          color: colors.lightText,
          size: 24,
        }),
      ]),
    }),
  ]),
)
