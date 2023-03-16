import { $, $f, A, constVoid, IO, O, Option, Ord, RIO, T } from 'fp'
import { Share } from 'react-native'
import { ScrollView, Text } from 'src/components/hyperscript/reactNative'
import { ActivityIndicator } from 'src/components/util-props/basic/ActivityIndicator'
import { Pressable } from 'src/components/util-props/basic/Pressable'
import { Row } from 'src/components/util-props/basic/Row'
import { Txt } from 'src/components/util-props/basic/Txt'
import { View } from 'src/components/util-props/basic/View'
import { MaterialIcons } from 'src/components/util-props/icons/MaterialIcons'
import { Header } from 'src/components/util-props/react-navigation/Header'
import { HeaderBackButton } from 'src/components/util-props/react-navigation/HeaderBackButton'
import {
  getRatingTotal,
  Player,
  PlayerNameOrd,
  PlayerPositionOrd,
  PlayerRatingOrd,
  RatingShow,
  TeamListShowSensitive,
} from 'src/datatypes/Player'
import { goBack } from 'src/slices/routes'
import { colors } from 'src/theme'
import { Color } from 'src/utils/datatypes'
import { div, toFixedLocale } from 'src/utils/Number'

export const ResultView = ({
  result,
}: {
  result: Option<Array<Array<Player>>>
}) =>
  View({ flex: 1 })([
    View({ bg: colors.white })([
      Header({
        title: 'Resultado',
        headerStyle: { backgroundColor: colors.primary.$5 },
        headerTitleStyle: { color: colors.text.light },
        headerLeft: HeaderBackButton({
          onPress: goBack,
          tintColor: colors.text.light,
        }),
        headerRight: Pressable({
          mr: 4,
          p: 8,
          round: 100,
          pressed: { bg: Color.withOpacity(47)(colors.black) },
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
          MaterialIcons({ name: 'share', color: colors.text.light, size: 24 }),
        ]),
      }),
    ]),
    ScrollView({ contentContainerStyle: { flexGrow: 1 } })(
      $(
        result,
        O.matchW(
          () => [
            View({ flex: 1, justify: 'center' })([
              ActivityIndicator({ color: colors.primary.$4 }),
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
    bg: colors.white,
    m: 4,
    p: 4,
    round: 8,
    shadow: 1,
  })([
    Txt({ color: colors.text.dark, align: 'center', size: 16, weight: 600 })(
      title,
    ),
    Text({ style: { color: Color.toHex(colors.text.gray), fontSize: 12 } })([
      () => 'Número de jogadores: ',
      Txt()(numPlayers.toString()),
    ]),
    Text({ style: { color: Color.toHex(colors.text.gray), fontSize: 12 } })([
      () => 'Média de habilidade: ',
      Txt()(avgRating),
    ]),
    Text({ style: { color: Color.toHex(colors.text.gray), fontSize: 12 } })([
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
    Txt({ color: colors.text.dark, weight: 600 })(RatingShow.show(rating)),
    Txt({ color: colors.text.dark, numberOfLines: 1 })(` - ${name}`),
    Txt({ color: colors.text.dark })(` (${position})`),
  ])
