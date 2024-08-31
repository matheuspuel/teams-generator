import { Array, Option, Order, identity, pipe } from 'effect'
import { NonEmptyReadonlyArray } from 'effect/Array'
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
import { shareResult, toggleRatingVisibility } from 'src/events/result'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { getActiveModality } from 'src/slices/groups'
import { toFixedLocale } from 'src/utils/Number'
import { BannerAd } from '../components/custom/BannerAd'

export const ResultView = memoizedConst('ResultView')(() => {
  const result = useSelector(s => s.result)
  const modality = useSelector(s => getActiveModality(s))
  const isRatingVisible = useSelector(s => s.preferences.isRatingVisible)
  return Option.match(modality, {
    onNone: () => Nothing,
    onSome: modality =>
      View({ flex: 1 })([
        View()([
          Header({
            title: t('Result'),
            headerLeft: HeaderButtonRow([
              HeaderButton({
                onPress: back,
                icon: MaterialIcons({ name: 'arrow-back' }),
              }),
            ]),
            headerRight: HeaderButtonRow([
              HeaderButton({
                onPress: toggleRatingVisibility,
                icon: MaterialIcons({
                  name: isRatingVisible ? 'visibility' : 'visibility-off',
                }),
              }),
              HeaderButton({
                onPress: shareResult,
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
              onSome: Array.map((t, i) =>
                TeamItem({
                  key: i.toString(),
                  index: i,
                  players: t,
                  modality,
                  isRatingVisible,
                }),
              ),
            }),
          ),
        ),
        BannerAd,
      ]),
  })
})

const TeamItem = (props: {
  key: string
  index: number
  players: Array<Player>
  modality: Modality
  isRatingVisible: boolean
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
    gap: 8,
    round: 8,
    shadow: 1,
  })([
    Txt({ size: 16, weight: 600 })(title),
    View()([
      TxtContext({ align: 'left', color: Colors.text.secondary, size: 12 })([
        Txt({ align: 'left' })(`${t('Number of players')}: `),
        Txt()(numPlayers.toString()),
      ]),
      ...(props.isRatingVisible
        ? [
            TxtContext({
              align: 'left',
              color: Colors.text.secondary,
              size: 12,
            })([
              Txt({ align: 'left' })(`${t('Average rating')}: `),
              Txt()(averageRating),
            ]),
            TxtContext({
              align: 'left',
              color: Colors.text.secondary,
              size: 12,
            })([
              Txt({ align: 'left' })(`${t('Total rating')}: `),
              Txt()(totalRating.toString()),
            ]),
          ]
        : []),
    ]),
    View({ gap: 4 })([
      ...pipe(
        props.players,
        Array.sortBy(
          Player.PositionOrd({ modality: props.modality }),
          Order.reverse(Player.RatingOrd),
          Player.NameOrd,
        ),
        Array.map(p =>
          PlayerItem({
            key: p.id,
            player: p,
            modality: props.modality,
            isRatingVisible: props.isRatingVisible,
          }),
        ),
      ),
    ]),
  ])
}

const PlayerItem = ({
  key,
  player: { name, positionAbbreviation, rating },
  modality,
  isRatingVisible,
}: {
  key: string
  player: Player
  modality: Modality
  isRatingVisible: boolean
}) =>
  Row({ key: key })([
    ...(isRatingVisible
      ? [Txt({ weight: 600 })(Rating.toString(rating)), Txt()(` - `)]
      : []),
    Txt({ numberOfLines: 1 })(name),
    Txt()(
      ` (${pipe(
        identity<
          NonEmptyReadonlyArray<
            Position.StaticPosition | Position.CustomPosition
          >
        >(modality.positions),
        Array.findFirst(_ => _.abbreviation === positionAbbreviation),
        Option.map(Position.toAbbreviationString),
        Option.getOrElse(() => '-'),
      )})`,
    ),
  ])
