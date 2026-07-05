import ShareIcon from '@expo/material-symbols/share.xml'
import VisibilityIcon from '@expo/material-symbols/visibility.xml'
import VisibilityOffIcon from '@expo/material-symbols/visibility_off.xml'
import {
  Array,
  Effect,
  Exit,
  Option,
  Order,
  Runtime,
  identity,
  pipe,
} from 'effect'
import { NonEmptyReadonlyArray } from 'effect/Array'
import { Stack } from 'expo-router'
import * as React from 'react'
import {
  ActivityIndicator,
  Row,
  ScrollView,
  Txt,
  TxtContext,
  View,
} from 'src/components'
import { useRuntime } from 'src/contexts/Runtime'
import { Modality, Player, Position, Rating } from 'src/datatypes'
import { interruptResultGeneration } from 'src/events/group'
import { shareResult, toggleRatingVisibility } from 'src/events/result'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { getActiveModality } from 'src/slices/groups'
import { toFixedLocale } from 'src/utils/Number'

export default function ResultScreen() {
  const runtime = useRuntime()
  const result = useSelector(s => s.result)
  const modality = useSelector(s => getActiveModality(s))
  const isRatingVisible = useSelector(s => s.preferences.isRatingVisible)
  React.useEffect(() => {
    return () => void interruptResultGeneration.pipe(Runtime.runFork(runtime))
  }, [])
  return Option.match(modality, {
    onNone: () => null,
    onSome: modality => (
      <View flex={1}>
        <Stack.Title>{t('Result')}</Stack.Title>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            onPress={() =>
              toggleRatingVisibility.pipe(Runtime.runFork(runtime))
            }
            icon={isRatingVisible ? VisibilityIcon : VisibilityOffIcon}
          />
          <Stack.Toolbar.Button
            onPress={() => shareResult.pipe(Runtime.runFork(runtime))}
            icon={ShareIcon}
          />
        </Stack.Toolbar>
        <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 8, p: 8 }}>
          {pipe(
            result.poll,
            Effect.runSync,
            Exit.fromOption,
            Exit.flatten,
            Exit.match({
              onFailure: () => (
                <View flex={1} justify="center">
                  <ActivityIndicator color={Colors.primary} />
                </View>
              ),
              onSuccess: Array.map((t, i) => (
                <TeamItem
                  key={i.toString()}
                  index={i}
                  players={t}
                  modality={modality}
                  isRatingVisible={isRatingVisible}
                />
              )),
            }),
          )}
        </ScrollView>
      </View>
    ),
  })
}

const TeamItem = (props: {
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
  return (
    <View bg={Colors.card} p={8} gap={8} round={8} shadow={1}>
      <Txt size={16} weight={600}>
        {title}
      </Txt>
      <View>
        <TxtContext align="left" color={Colors.text.secondary} size={12}>
          <Txt align="left">{`${t('Number of players')}: `}</Txt>
          <Txt>{numPlayers.toString()}</Txt>
        </TxtContext>
        {props.isRatingVisible && (
          <>
            <TxtContext align="left" color={Colors.text.secondary} size={12}>
              <Txt align="left">{`${t('Average rating')}: `}</Txt>
              <Txt>{averageRating}</Txt>
            </TxtContext>
            <TxtContext align="left" color={Colors.text.secondary} size={12}>
              <Txt align="left">{`${t('Total rating')}: `}</Txt>
              <Txt>{totalRating.toString()}</Txt>
            </TxtContext>
          </>
        )}
      </View>
      <View gap={4}>
        {pipe(
          props.players,
          Array.sortBy(
            Player.PositionOrd({ modality: props.modality }),
            Order.reverse(Player.RatingOrd),
            Player.NameOrd,
          ),
          Array.map(p => (
            <PlayerItem
              key={p.id}
              player={p}
              modality={props.modality}
              isRatingVisible={props.isRatingVisible}
            />
          )),
        )}
      </View>
    </View>
  )
}

const PlayerItem = ({
  player: { name, positionAbbreviation, rating },
  modality,
  isRatingVisible,
}: {
  player: Player
  modality: Modality
  isRatingVisible: boolean
}) => (
  <Row>
    {isRatingVisible ? (
      <>
        <Txt weight={600}>{Rating.toString(rating)}</Txt>
        <Txt>{` - `}</Txt>
      </>
    ) : null}
    <Txt numberOfLines={1}>{name}</Txt>
    <Txt>{` (${pipe(
      identity<
        NonEmptyReadonlyArray<Position.StaticPosition | Position.CustomPosition>
      >(modality.positions),
      Array.findFirst(_ => _.abbreviation === positionAbbreviation),
      Option.map(Position.toAbbreviationString),
      Option.getOrElse(() => '-'),
    )})`}</Txt>
  </Row>
)
