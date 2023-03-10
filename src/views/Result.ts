import { $, $f, A, constVoid, IO, O, Option, Ord, RIO, T } from 'fp'
import { Share } from 'react-native'
import { Txt } from 'src/components/hyperscript/derivative'
import { MaterialIcons } from 'src/components/hyperscript/icons'
import {
  ActivityIndicator,
  ScrollView,
  Text,
} from 'src/components/hyperscript/reactNative'
import { Header } from 'src/components/safe/react-navigation/Header'
import { HeaderBackButton } from 'src/components/safe/react-navigation/HeaderBackButton'
import { Pressable } from 'src/components/util-props/basic/Pressable'
import { Row } from 'src/components/util-props/basic/Row'
import { View } from 'src/components/util-props/basic/View'
import {
  getRatingTotal,
  Player,
  PlayerNameOrd,
  PlayerPositionOrd,
  PlayerRatingOrd,
  RatingShow,
  TeamListShowSensitive,
} from 'src/datatypes/Player'
import { goBack } from 'src/redux/slices/routes'
import { theme } from 'src/theme'
import { div, toFixedLocale } from 'src/utils/Number'

export const ResultView = ({
  result,
}: {
  result: Option<Array<Array<Player>>>
}) =>
  View({ flex: 1 })([
    View({ bg: theme.colors.white })([
      Header({
        title: 'Resultado',
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
            RIO.fromIO,
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
            View({ flex: 1, justify: 'center' })([
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
    bg: theme.colors.white,
    m: 4,
    p: 4,
    round: 8,
    shadow: 1,
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
      () => 'Número de jogadores: ',
      Txt()(numPlayers.toString()),
    ]),
    Text({ style: { color: theme.colors.grayText, fontSize: 12 } })([
      () => 'Média de habilidade: ',
      Txt()(avgRating),
    ]),
    Text({ style: { color: theme.colors.grayText, fontSize: 12 } })([
      () => 'Total de habilidade: ',
      Txt()(totalRating.toString()),
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

const PlayerItem = ({
  key,
  data: { name, position, rating },
}: {
  key: string
  data: Player
}) =>
  Row({ key: key, p: 4 })([
    Txt({
      style: { color: theme.colors.darkText, fontWeight: 'bold' },
    })(RatingShow.show(rating)),
    Txt({ style: { color: theme.colors.darkText }, numberOfLines: 1 })(
      ` - ${name}`,
    ),
    Txt({ style: { color: theme.colors.darkText } })(` (${position})`),
  ])
