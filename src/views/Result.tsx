import { get } from '@fp-ts/optic'
import { $, $f, A, constVoid, Eq, IO, none, O, Option, Ord, some, T } from 'fp'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Share } from 'react-native'
import { generateRandomBalancedTeams } from 'src/business/distribution'
import { Txt } from 'src/components/hyperscript/derivative'
import { MaterialIcons } from 'src/components/hyperscript/icons'
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
  PlayerIsActive,
  PlayerNameOrd,
  PlayerPositionOrd,
  PlayerRatingOrd,
  RatingShow,
  TeamListShowSensitive,
} from 'src/datatypes/Player'
import { getGroupById } from 'src/redux/slices/groups'
import { getParameters } from 'src/redux/slices/parameters'
import { UiLens } from 'src/redux/slices/ui'
import { useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { theme } from 'src/theme'
import { div, toFixedLocale } from 'src/utils/Number'

export const ResultView = (props: RootStackScreenProps<'Result'>) => {
  const { navigation } = props
  const id = useAppSelector(get(UiLens.at('selectedGroupId')))
  const group = useAppSelector(
    s =>
      $(
        id,
        O.chain(id => getGroupById(id)(s)),
      ),
    O.getEq(Eq.eqStrict),
  )
  const parameters = useAppSelector(getParameters)
  const [result, setResult] = useState<Option<Array<Array<Player>>>>(none)

  useEffect(
    $(
      group,
      O.map(g => g.players),
      O.getOrElseW(() => []),
      A.filter(PlayerIsActive),
      generateRandomBalancedTeams({
        position: parameters.position,
        rating: parameters.rating,
      })(parameters.teamsCount),
      IO.chain(s => () => setResult(some(s))),
    ),
    [],
  )

  useLayoutEffect(
    () =>
      navigation.setOptions({
        headerRight: ({ tintColor }) =>
          Pressable({
            style: ({ pressed }) => ({
              marginRight: 4,
              padding: 8,
              borderRadius: 100,
              backgroundColor: pressed ? theme.colors.primary[700] : undefined,
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
          })([MaterialIcons({ name: 'share', color: tintColor, size: 24 })]),
      }),
    [result],
  )

  return $(
    result,
    O.matchW(
      () =>
        View({ style: { flex: 1, justifyContent: 'center' } })([
          ActivityIndicator({
            size: 'large',
            color: theme.colors.primary[500],
          }),
        ]),
      r =>
        $(
          ScrollView({ style: { flex: 1 } })([
            $(
              r,
              A.mapWithIndex((i, t) =>
                TeamItem({ key: i.toString(), index: i, players: t }),
              ),
            ),
          ]),
        ),
    ),
  )
}

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
    $(
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
