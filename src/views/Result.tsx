import { MaterialIcons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { Icon, Pressable, ScrollView, Spinner, useToast } from 'native-base'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { generateRandomBalancedTeams } from 'src/business/distribution'
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
import { useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { theme } from 'src/theme'
import {
  A,
  constVoid,
  Eq,
  flow,
  IO,
  none,
  O,
  Option,
  Ord,
  pipe,
  some,
  T,
} from 'src/utils/fp-ts'
import { div, toFixedLocale } from 'src/utils/Number'

export const ResultView = (props: RootStackScreenProps<'Result'>) => {
  const { navigation, route } = props
  const { id } = route.params
  const group = useAppSelector(getGroupById(id), O.getEq(Eq.eqStrict).equals)
  const parameters = useAppSelector(getParameters)
  const [result, setResult] = useState<Option<Array<Array<Player>>>>(none)
  const toast = useToast()

  useEffect(
    pipe(
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
        headerRight: ({ tintColor }) => (
          <Pressable
            mr="1"
            p="2"
            rounded="full"
            _pressed={{ bg: 'primary.700' }}
            onPress={pipe(
              result,
              O.matchW(
                () => T.of(undefined),
                flow(
                  TeamListShowSensitive.show,
                  t => () => Clipboard.setStringAsync(t),
                  T.chainIOK(
                    () => () => void toast.show({ description: 'Copiado' }),
                  ),
                ),
              ),
              IO.map(constVoid),
            )}
          >
            <Icon
              size="lg"
              color={tintColor}
              as={<MaterialIcons name="content-copy" />}
            />
          </Pressable>
        ),
      }),
    [result],
  )

  return pipe(
    result,
    O.matchW(
      () => (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Spinner size="lg" />
        </View>
      ),
      r =>
        pipe(
          <ScrollView flex={1}>
            {pipe(
              r,
              A.mapWithIndex((i, t) => (
                <TeamItem key={i} index={i} players={t} />
              )),
            )}
          </ScrollView>,
        ),
    ),
  )
}

const TeamItem = (props: { index: number; players: Array<Player> }) => {
  const title = `Time ${props.index + 1}`
  const numPlayers = props.players.length
  const totalRating = getRatingTotal(props.players)
  const avgRating = toFixedLocale(2)(div(numPlayers)(totalRating))
  return (
    <View
      style={{
        backgroundColor: theme.colors.white,
        margin: 4,
        padding: 4,
        borderRadius: 8,
        elevation: 1,
      }}
    >
      <Text
        style={{
          color: theme.colors.darkText,
          textAlign: 'center',
          fontSize: 16,
          fontWeight: 'bold',
        }}
      >
        {title}
      </Text>
      <Text style={{ color: theme.colors.grayText, fontSize: 12 }}>
        Número de jogadores: <Text>{numPlayers}</Text>
      </Text>
      <Text style={{ color: theme.colors.grayText, fontSize: 12 }}>
        Média de habilidade: <Text>{avgRating}</Text>
      </Text>
      <Text style={{ color: theme.colors.grayText, fontSize: 12 }}>
        Total de habilidade: <Text>{totalRating}</Text>
      </Text>
      {pipe(
        props.players,
        A.sortBy([
          PlayerPositionOrd,
          Ord.reverse(PlayerRatingOrd),
          PlayerNameOrd,
        ]),
        A.map(p => <PlayerItem key={p.id} data={p} />),
      )}
    </View>
  )
}

const PlayerItem = (props: { data: Player }) => {
  const { name, position, rating } = props.data
  return (
    <View style={{ flexDirection: 'row', padding: 4 }}>
      <Text style={{ color: theme.colors.darkText, fontWeight: 'bold' }}>
        {RatingShow.show(rating)}
      </Text>
      <Text style={{ color: theme.colors.darkText }} numberOfLines={1}>
        {' '}
        - {name}
      </Text>
      <Text style={{ color: theme.colors.darkText }}> ({position})</Text>
    </View>
  )
}
