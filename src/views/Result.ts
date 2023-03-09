import { $, $f, A, constVoid, IO, O, Option, Ord, T } from 'fp'
import { Share } from 'react-native'
import { Txt } from 'src/components/hyperscript/derivative'
import { MaterialIcons } from 'src/components/hyperscript/icons'
import {
  Header,
  HeaderBackButton,
} from 'src/components/hyperscript/react-navigation'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'src/components/hyperscript/reactNative'
import {
  getRatingTotal,
  Player,
  PlayerNameOrd,
  PlayerPositionOrd,
  PlayerRatingOrd,
  RatingShow,
  TeamListShowSensitive,
} from 'src/datatypes/Player'
import { AppEnv } from 'src/Env'
import { goBack } from 'src/redux/slices/routes'
import { theme } from 'src/theme'
import { div, toFixedLocale } from 'src/utils/Number'

export const ResultView =
  ({ result }: { result: Option<Array<Array<Player>>> }) =>
  (env: AppEnv) =>
    View({ style: { flex: 1 } })([
      View({ style: { backgroundColor: theme.colors.white } })([
        Header({
          title: 'Resultado',
          headerStyle: { backgroundColor: theme.colors.primary[600] },
          headerTitleStyle: { color: theme.colors.lightText },
          headerLeft: () =>
            HeaderBackButton({
              onPress: goBack(env),
              tintColor: theme.colors.lightText,
            }),
          headerRight: () =>
            Pressable({
              style: ({ pressed }) => ({
                marginRight: 4,
                padding: 8,
                borderRadius: 100,
                backgroundColor: pressed
                  ? theme.colors.primary[700]
                  : undefined,
              }),
              onPress: $(
                result,
                O.match(
                  () => T.of(undefined),
                  $f(
                    TeamListShowSensitive.show,
                    t => () => Share.share({ message: t, title: 'Times' }),
                    T.map(constVoid),
                  ),
                ),
                IO.map(constVoid),
              ),
            })([
              MaterialIcons({
                name: 'share',
                color: theme.colors.lightText,
                size: 24,
              }),
            ]),
        }),
      ]),
      ScrollView({ contentContainerStyle: { flexGrow: 1 } })(
        $(
          result,
          O.matchW(
            () => [
              View({ style: { flex: 1, justifyContent: 'center' } })([
                ActivityIndicator({
                  size: 'large',
                  color: theme.colors.primary[500],
                }),
              ]),
            ],
            A.mapWithIndex((i, t) =>
              TeamItem({ key: i.toString(), index: i, players: t }),
            ),
          ),
        ),
      ),
    ])

const TeamItem = (props: {
  key: string
  index: number
  players: Array<Player>
}) => {
  const title = `Time ${props.index + 1}`
  const numPlayers = props.players.length
  const totalRating = getRatingTotal(props.players)
  const avgRating = toFixedLocale(2)(div(numPlayers)(totalRating))
  return View({
    key: props.key,
    style: {
      backgroundColor: theme.colors.white,
      margin: 4,
      padding: 4,
      borderRadius: 8,
      elevation: 1,
    },
  })([
    Txt({
      style: {
        color: theme.colors.darkText,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
      },
    })(title),
    Text({ style: { color: theme.colors.grayText, fontSize: 12 } })([
      'Número de jogadores: ',
      Txt({})(numPlayers.toString()),
    ]),
    Text({ style: { color: theme.colors.grayText, fontSize: 12 } })([
      'Média de habilidade: ',
      Txt({})(avgRating),
    ]),
    Text({ style: { color: theme.colors.grayText, fontSize: 12 } })([
      'Total de habilidade: ',
      Txt({})(totalRating.toString()),
    ]),
    ...$(
      props.players,
      A.sortBy([
        PlayerPositionOrd,
        Ord.reverse(PlayerRatingOrd),
        PlayerNameOrd,
      ]),
      A.map(p => PlayerItem({ key: p.id, data: p })),
    ),
  ])
}

const PlayerItem = (props: { key: string; data: Player }) => {
  const { name, position, rating } = props.data
  return View({ key: props.key, style: { flexDirection: 'row', padding: 4 } })([
    Txt({
      style: { color: theme.colors.darkText, fontWeight: 'bold' },
    })(RatingShow.show(rating)),
    Txt({ style: { color: theme.colors.darkText }, numberOfLines: 1 })(
      ` - ${name}`,
    ),
    Txt({ style: { color: theme.colors.darkText } })(` (${position})`),
  ])
}
