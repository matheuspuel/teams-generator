import { get } from '@fp-ts/optic'
import { $, $f, A, Apply, O, RA, Rec, RIO, S, Str, Tup } from 'fp'
import { not } from 'fp-ts/Predicate'
import { memoizedConst } from 'src/components/helpers'
import { Txt } from 'src/components/hyperscript/derivative'
import { MaterialIcons } from 'src/components/hyperscript/icons'
import { ScrollView } from 'src/components/hyperscript/reactNative'
import { Input } from 'src/components/safe/basic/Input'
import { Header } from 'src/components/safe/react-navigation/Header'
import { HeaderBackButton } from 'src/components/safe/react-navigation/HeaderBackButton'
import { Pressable } from 'src/components/util-props/basic/Pressable'
import { Row } from 'src/components/util-props/basic/Row'
import { View } from 'src/components/util-props/basic/View'
import { RatingList, RatingShow } from 'src/datatypes/Player'
import { PositionDict, PositionOrd } from 'src/datatypes/Position'
import { execute, replaceSApp } from 'src/redux'
import {
  createPlayer,
  deleteCurrentPlayer,
  editPlayer,
} from 'src/redux/slices/groups'
import { PlayerForm, PlayerFormLens } from 'src/redux/slices/playerForm'
import { goBack } from 'src/redux/slices/routes'
import { UiLens } from 'src/redux/slices/ui'
import { theme } from 'src/theme'

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
        Txt({
          style: {
            fontWeight: '500',
            color: theme.colors.gray[500],
            marginVertical: 4,
          },
        })('Nome'),
        Input({
          placeholder: 'Ex: Pedro',
          placeholderTextColor: theme.colors.gray[400],
          value: name,
          onChange: onChangeName,
          cursorColor: theme.colors.darkText,
          style: ({ isFocused }) => ({
            fontSize: 12,
            padding: 8,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderRadius: 4,
            borderColor: isFocused
              ? theme.colors.primary[600]
              : theme.colors.gray[300],
            backgroundColor: isFocused
              ? theme.colors.primary[600] + '1f'
              : undefined,
          }),
        }),
      ]),
      View({ p: 4 })([
        Txt({
          style: {
            fontWeight: '500',
            color: theme.colors.gray[500],
            marginVertical: 4,
          },
        })('Posição'),
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
                      ? theme.colors.primary[500]
                      : theme.colors.primary[500] + '3f',
                })([
                  Txt({
                    style: {
                      fontSize: 14,
                      textAlign: 'center',
                      color: theme.colors.lightText,
                    },
                  })(p),
                ]),
              ]),
            ),
          ),
        ),
      ]),
      View({ p: 4 })([
        Txt({
          style: {
            fontWeight: '500',
            color: theme.colors.gray[500],
            marginVertical: 4,
          },
        })('Habilidade'),
        Txt({
          style: {
            textAlign: 'center',
            fontSize: 24,
            fontWeight: '700',
            color: theme.colors.primary[600],
          },
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
                          style: {
                            fontSize: 60,
                            textAlign: 'center',
                            color: theme.colors.primary[600],
                          },
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
                    bg: theme.colors.primary[500],
                    round: 10,
                    roundB: 0,
                  })([]),
                  ...(r % 1 === 0
                    ? [
                        View({ absolute: { top: 10 } })([
                          Txt({
                            style: {
                              textAlign: 'center',
                              fontSize: 12,
                              color: theme.colors.primary[500],
                              fontWeight: '900',
                              width: 100,
                            },
                          })(r.toString()),
                        ]),
                      ]
                    : []),
                ]),
              ]),
            ),
          ),
        ),
        View({ h: 4, bg: theme.colors.primary[500], round: 10 })([]),
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
      bg: !name ? theme.colors.primary[600] + '5f' : theme.colors.primary[600],
      pressed: { bg: name ? theme.colors.primary[800] : undefined },
      onPress: onSave,
    })([
      Txt({
        style: {
          textAlign: 'center',
          color: !name ? theme.colors.white + '5f' : theme.colors.white,
        },
      })('Gravar'),
    ]),
  ])

const ScreenHeader = memoizedConst('Header')(
  View({ bg: theme.colors.white })([
    Header({
      title: 'Jogador',
      headerStyle: { backgroundColor: theme.colors.primary[600] },
      headerTitleStyle: { color: theme.colors.lightText },
      headerLeft: HeaderBackButton({
        onPress: goBack,
        tintColor: theme.colors.lightText,
      }),
      headerRight: Pressable({
        mr: 4,
        p: 8,
        round: 100,
        pressed: { bg: theme.colors.primary[700] },
        onPress: deleteCurrentPlayer,
      })([
        MaterialIcons({
          name: 'delete',
          color: theme.colors.lightText,
          size: 24,
        }),
      ]),
    }),
  ]),
)
