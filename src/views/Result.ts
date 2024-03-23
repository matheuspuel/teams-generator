import { Option, Order, ReadonlyArray, identity, pipe } from 'effect'
import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
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
import { back } from 'src/events/core'
import { shareResult } from 'src/events/result'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { getActiveModality } from 'src/slices/groups'
import { toFixedLocale } from 'src/utils/Number'

export const ResultView = memoizedConst('ResultView')(() => {
  const result = useSelector(s => s.result)
  const modality = useSelector(s => getActiveModality(s))
  return Option.match(modality, {
    onNone: () => Nothing,
    onSome: modality =>
      View({ flex: 1 })([
        View()([
          Header({
            title: t('Result'),
            headerLeft: HeaderButtonRow([
              HeaderButton({
                onPress: back(),
                icon: MaterialIcons({ name: 'arrow-back' }),
              }),
            ]),
            headerRight: HeaderButtonRow([
              HeaderButton({
                onPress: shareResult(),
                icon: MaterialIcons({ name: 'share' }),
              }),
            ]),
          }),
        ]),
        ScrollView({ contentContainerStyle: { flexGrow: 1, gap: 8, p: 8 } })(
          pipe(
            result,
            Option.match({
              onNone: () => [
                View({ flex: 1, justify: 'center' })([
                  ActivityIndicator({ color: Colors.primary }),
                ]),
              ],
              onSome: ReadonlyArray.map((t, i) =>
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
  const averageRating =
    numPlayers === 0 ? '-' : toFixedLocale(2)(totalRating / numPlayers)
  return View({
    key: props.key,
    bg: Colors.card,
    p: 8,
    round: 8,
    shadow: 1,
  })([
    Txt({ size: 16, weight: 600 })(title),
    TxtContext({ align: 'left', color: Colors.text.secondary, size: 12 })([
      Txt({ align: 'left' })(`${t('Number of players')}: `),
      Txt()(numPlayers.toString()),
    ]),
    TxtContext({ align: 'left', color: Colors.text.secondary, size: 12 })([
      Txt({ align: 'left' })(`${t('Average rating')}: `),
      Txt()(averageRating),
    ]),
    TxtContext({ align: 'left', color: Colors.text.secondary, size: 12 })([
      Txt({ align: 'left' })(`${t('Total rating')}: `),
      Txt()(totalRating.toString()),
    ]),
    ...pipe(
      props.players,
      ReadonlyArray.sortBy(
        Player.PositionOrd({ modality: props.modality }),
        Order.reverse(Player.RatingOrd),
        Player.NameOrd,
      ),
      ReadonlyArray.map(p =>
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
        identity<
          NonEmptyReadonlyArray<
            Position.StaticPosition | Position.CustomPosition
          >
        >(modality.positions),
        ReadonlyArray.findFirst(_ => _.abbreviation === positionAbbreviation),
        Option.map(Position.toAbbreviationString),
        Option.getOrElse(() => '-'),
      )})`,
    ),
  ])
