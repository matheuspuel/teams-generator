import { MaterialIcons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { Flex, Icon, Pressable, Spinner, Text, useToast } from 'native-base'
import { useEffect, useLayoutEffect, useState } from 'react'
import { generateRandomBalancedTeams } from 'src/business/distribution'
import {
  getRatingTotal,
  Player,
  PlayerIsActive,
  TeamListShowSensitive,
} from 'src/datatypes/Player'
import { getGroupById } from 'src/redux/slices/groups'
import { useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import {
  A,
  Eq,
  flow,
  IO,
  none,
  O,
  Option,
  pipe,
  some,
  T,
  TE,
} from 'src/utils/fp-ts'
import { div } from 'src/utils/Number'

export const ResultView = (props: RootStackScreenProps<'Result'>) => {
  const { navigation, route } = props
  const { id } = route.params
  const group = useAppSelector(getGroupById(id), O.getEq(Eq.eqStrict).equals)
  const [result, setResult] = useState<Option<Player[][]>>(none)
  const toast = useToast()

  useEffect(() => {
    pipe(
      group,
      O.map(g => g.players),
      O.getOrElseW(() => []),
      A.filter(PlayerIsActive),
      generateRandomBalancedTeams({
        position: true,
        rating: true,
      })(2),
      IO.chain(s => () => setResult(some(s))),
    )()
  }, [])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }) => (
        <Pressable
          mr="1"
          p="2"
          rounded="full"
          _pressed={{ bg: 'primary.700' }}
          onPress={() => {
            pipe(
              result,
              O.matchW(
                () => TE.of(undefined),
                flow(
                  TeamListShowSensitive.show,
                  t => () => Clipboard.setStringAsync(t),
                  T.chainFirstIOK(
                    () => () => toast.show({ description: 'Copiado' }),
                  ),
                ),
              ),
            )()
          }}
        >
          <Icon
            size="lg"
            color={tintColor}
            as={<MaterialIcons name="content-copy" />}
          />
        </Pressable>
      ),
    })
  }, [result])

  return pipe(
    result,
    O.matchW(
      () => (
        <Flex flex={1} justify="center">
          <Spinner size="lg" />
        </Flex>
      ),
      r =>
        pipe(
          <Flex flex={1}>
            {pipe(
              r,
              A.mapWithIndex((i, t) => (
                <TeamItem key={i} index={i} players={t} />
              )),
            )}
          </Flex>,
        ),
    ),
  )
}

const TeamItem = (props: { index: number; players: Player[] }) => {
  const title = `Time ${props.index + 1}`
  const numPlayers = props.players.length
  const totalRating = getRatingTotal(props.players)
  const avgRating = div(numPlayers)(totalRating)
  return (
    <Flex bg="white" m="1" p="1" rounded="lg" shadow="1">
      <Text textAlign="center" fontSize="md" bold>
        {title}
      </Text>
      <Text fontSize="xs" color="grayText">
        Número de jogadores: <Text>{numPlayers}</Text>
      </Text>
      <Text fontSize="xs" color="grayText">
        Média de habilidade: <Text>{avgRating}</Text>
      </Text>
      <Text fontSize="xs" color="grayText">
        Total de habilidade: <Text>{totalRating}</Text>
      </Text>
      {pipe(
        props.players,
        A.map(p => <PlayerItem key={p.id} data={p} />),
      )}
    </Flex>
  )
}

const PlayerItem = (props: { data: Player }) => {
  const { name, position, rating } = props.data
  return (
    <Flex direction="row" p="1">
      <Text bold>{rating}</Text>
      <Text isTruncated> - {name}</Text>
      <Text> ({position})</Text>
    </Flex>
  )
}
