import { A, Number, O, Ord, pipe } from 'fp'
import {
  ActivityIndicator,
  Header,
  MaterialIcons,
  Nothing,
  Row,
  ScrollView,
  Txt,
  TxtContext,
  View,
} from 'src/components'
import { HeaderButton } from 'src/components/derivative/HeaderButton'
import { HeaderButtonRow } from 'src/components/derivative/HeaderButtonRow'
import { memoizedConst } from 'src/components/hyperscript'
import { Modality, Player, Position, Rating } from 'src/datatypes'
import { appEvents } from 'src/events'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { getActiveModality } from 'src/slices/groups'
import { toFixedLocale } from 'src/utils/Number'

const on = appEvents.result

export const ResultView = memoizedConst('ResultView')(() => {
  const result = useSelector(s => s.result)
  const modality = useSelector(s => getActiveModality(s))
  return O.match(modality, {
    onNone: () => Nothing,
    onSome: modality =>
      View({ flex: 1 })([
        View()([
          Header({
            title: t('Result'),
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
                  ActivityIndicator({ color: Colors.primary }),
                ]),
              ],
              onSome: A.map((t, i) =>
                TeamItem({ key: i.toString(), index: i, players: t, modality }),
              ),
            }),
          ),
        ),
      ]),
  })
})

const TeamItem = (props: {
  key: string
  index: number
  players: Array<Player>
  modality: Modality
}) => {
  const title = `${t('Team')} ${props.index + 1}`
  const numPlayers = props.players.length
  const totalRating = Player.getRatingTotal(props.players)
  const avgRating = toFixedLocale(2)(Number.div(numPlayers)(totalRating))
  return View({
    key: props.key,
    bg: Colors.card,
    m: 4,
    p: 4,
    round: 8,
    shadow: 1,
  })([
    Txt({ size: 16, weight: 600 })(title),
    TxtContext({ align: 'left', color: Colors.text.secondary, size: 12 })([
      Txt()(`${t('Number of players')}: `),
      Txt()(numPlayers.toString()),
    ]),
    TxtContext({ align: 'left', color: Colors.text.secondary, size: 12 })([
      Txt()(`${t('Rating average')}: `),
      Txt()(avgRating),
    ]),
    TxtContext({ align: 'left', color: Colors.text.secondary, size: 12 })([
      Txt()(`${t('Rating total')}: `),
      Txt()(totalRating.toString()),
    ]),
    ...pipe(
      props.players,
      A.sortBy(
        Player.PositionOrd({ modality: props.modality }),
        Ord.reverse(Player.RatingOrd),
        Player.NameOrd,
      ),
      A.map(p =>
        PlayerItem({ key: p.id, player: p, modality: props.modality }),
      ),
    ),
  ])
}

const PlayerItem = ({
  key,
  player: { name, positionAbbreviation, rating },
  modality,
}: {
  key: string
  player: Player
  modality: Modality
}) =>
  Row({ key: key, p: 4 })([
    Txt({ weight: 600 })(Rating.toString(rating)),
    Txt({ numberOfLines: 1 })(` - ${name}`),
    Txt()(
      ` (${pipe(
        modality.positions,
        A.findFirst(_ => _.abbreviation === positionAbbreviation),
        O.map(Position.toAbbreviationString),
        O.getOrElse(() => '-'),
      )})`,
    ),
  ])
