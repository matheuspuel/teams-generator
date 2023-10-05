import { A, Number, O, Ord, pipe } from 'fp'
import {
  ActivityIndicator,
  Header,
  MaterialIcons,
  Row,
  ScrollView,
  Txt,
  TxtContext,
  View,
} from 'src/components'
import { HeaderButton } from 'src/components/derivative/HeaderButton'
import { HeaderButtonRow } from 'src/components/derivative/HeaderButtonRow'
import { memoizedConst } from 'src/components/hyperscript'
import { Player, Rating } from 'src/datatypes'
import { appEvents } from 'src/events'
import { useSelector } from 'src/hooks/useSelector'
import { Colors } from 'src/services/Theme'
import { toFixedLocale } from 'src/utils/Number'

const on = appEvents.result

export const ResultView = memoizedConst('ResultView')(() => {
  const result = useSelector(s => s.result)
  return View({ flex: 1 })([
    View({ bg: Colors.white })([
      Header({
        title: 'Resultado',
        headerStyle: { backgroundColor: Colors.primary.$5 },
        headerTitleStyle: { color: Colors.text.light },
        headerLeft: HeaderButtonRow([
          HeaderButton({
            onPress: appEvents.back(),
            icon: MaterialIcons({ name: 'arrow-back' }),
          }),
        ]),
        headerRight: HeaderButtonRow([
          HeaderButton({
            onPress: on.share(),
            icon: MaterialIcons({ name: 'share' }),
          }),
        ]),
      }),
    ]),
    ScrollView({ contentContainerStyle: { flexGrow: 1 } })(
      pipe(
        result,
        O.match({
          onNone: () => [
            View({ flex: 1, justify: 'center' })([
              ActivityIndicator({ color: Colors.primary.$5 }),
            ]),
          ],
          onSome: A.map((t, i) =>
            TeamItem({ key: i.toString(), index: i, players: t }),
          ),
        }),
      ),
    ),
  ])
})

const TeamItem = (props: {
  key: string
  index: number
  players: Array<Player>
}) => {
  const title = `Time ${props.index + 1}`
  const numPlayers = props.players.length
  const totalRating = Player.getRatingTotal(props.players)
  const avgRating = toFixedLocale(2)(Number.div(numPlayers)(totalRating))
  return View({
    key: props.key,
    bg: Colors.white,
    m: 4,
    p: 4,
    round: 8,
    shadow: 1,
  })([
    Txt({ color: Colors.text.dark, size: 16, weight: 600 })(title),
    TxtContext({ align: 'left', color: Colors.text.gray, size: 12 })([
      Txt()('Número de jogadores: '),
      Txt()(numPlayers.toString()),
    ]),
    TxtContext({ align: 'left', color: Colors.text.gray, size: 12 })([
      Txt()('Média de habilidade: '),
      Txt()(avgRating),
    ]),
    TxtContext({ align: 'left', color: Colors.text.gray, size: 12 })([
      Txt()('Total de habilidade: '),
      Txt()(totalRating.toString()),
    ]),
    ...pipe(
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
    Txt({ color: Colors.text.dark, weight: 600 })(Rating.toString(rating)),
    Txt({ color: Colors.text.dark, numberOfLines: 1 })(` - ${name}`),
    Txt({ color: Colors.text.dark })(` (${position})`),
  ])
