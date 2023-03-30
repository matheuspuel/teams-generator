import { $, $f, A, constVoid, get, O, Option, Ord, RTE, S, T } from 'fp'
import { Share } from 'react-native'
import {
  ActivityIndicator,
  Header,
  MaterialIcons,
  Pressable,
  Row,
  ScrollView,
  Txt,
  TxtContext,
  View,
} from 'src/components/hyperscript'
import {
  getRatingTotal,
  Player,
  PlayerNameOrd,
  PlayerPositionOrd,
  PlayerRatingOrd,
  RatingShow,
  TeamListShowSensitive,
} from 'src/datatypes/Player'
import { execute } from 'src/services/Store'
import { Colors } from 'src/services/Theme'
import { ResultLens } from 'src/slices/result'
import { goBack } from 'src/slices/routes'
import { div, toFixedLocale } from 'src/utils/Number'

const onShareTeamList = $(
  execute(S.gets(get(ResultLens))),
  RTE.rightReaderIO,
  RTE.chainTaskK(
    O.match(
      () => T.of(undefined),
      $f(
        TeamListShowSensitive.show,
        t => () => Share.share({ message: t, title: 'Times' }),
        T.map(constVoid),
      ),
    ),
  ),
)

export const ResultView = ({
  result,
}: {
  result: Option<Array<Array<Player>>>
}) =>
  View({ flex: 1 })([
    View({ bg: Colors.white })([
      Header({
        title: 'Resultado',
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
          onPress: onShareTeamList,
          mr: 4,
          p: 8,
          borderless: true,
          foreground: true,
        })([
          MaterialIcons({ name: 'share', color: Colors.text.light, size: 24 }),
        ]),
      }),
    ]),
    ScrollView({ contentContainerStyle: { flexGrow: 1 } })(
      $(
        result,
        O.matchW(
          () => [
            View({ flex: 1, justify: 'center' })([
              ActivityIndicator({ color: Colors.primary.$4 }),
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
    bg: Colors.white,
    m: 4,
    p: 4,
    round: 8,
    shadow: 1,
  })([
    Txt({
      color: Colors.text.dark,
      align: 'center',
      size: 16,
      weight: 600,
    })(title),
    TxtContext({ color: Colors.text.gray, size: 12 })([
      Txt()('Número de jogadores: '),
      Txt()(numPlayers.toString()),
    ]),
    TxtContext({ color: Colors.text.gray, size: 12 })([
      Txt()('Média de habilidade: '),
      Txt()(avgRating),
    ]),
    TxtContext({ color: Colors.text.gray, size: 12 })([
      Txt()('Total de habilidade: '),
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
    Txt({ color: Colors.text.dark, weight: 600 })(RatingShow.show(rating)),
    Txt({ color: Colors.text.dark, numberOfLines: 1 })(` - ${name}`),
    Txt({ color: Colors.text.dark })(` (${position})`),
  ])
