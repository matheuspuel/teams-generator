import { $, A, Num, O, Option, Ord } from 'fp'
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
} from 'src/components'
import { named2 } from 'src/components/helpers'
import { Player, Rating } from 'src/datatypes'
import { appEvents } from 'src/events'
import { Colors } from 'src/services/Theme'
import { toFixedLocale } from 'src/utils/Number'

const on = appEvents.result

export const ResultView = named2('Result')(
  ({ result }: { result: Option<Array<Array<Player>>> }) =>
    View({ flex: 1 })([
      View({ bg: Colors.white })([
        Header({
          title: 'Resultado',
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
            onPress: on.share(),
            mr: 4,
            p: 8,
            borderless: true,
            foreground: true,
          })([
            MaterialIcons({
              name: 'share',
              color: Colors.text.light,
              size: 24,
            }),
          ]),
        }),
      ]),
      ScrollView({ contentContainerStyle: { flexGrow: 1 } })(
        $(
          result,
          O.match(
            () => [
              View({ flex: 1, justify: 'center' })([
                ActivityIndicator({ color: Colors.primary.$5 }),
              ]),
            ],
            A.map((t, i) =>
              TeamItem({ key: i.toString(), index: i, players: t }),
            ),
          ),
        ),
      ),
    ]),
)

const TeamItem = (props: {
  key: string
  index: number
  players: Array<Player>
}) => {
  const title = `Time ${props.index + 1}`
  const numPlayers = props.players.length
  const totalRating = Player.getRatingTotal(props.players)
  const avgRating = toFixedLocale(2)(Num.div(numPlayers)(totalRating))
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
      A.sortBy(
        Player.PositionOrd,
        Ord.reverse(Player.RatingOrd),
        Player.NameOrd,
      ),
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
    Txt({ color: Colors.text.dark, weight: 600 })(Rating.Show.show(rating)),
    Txt({ color: Colors.text.dark, numberOfLines: 1 })(` - ${name}`),
    Txt({ color: Colors.text.dark })(` (${position})`),
  ])
