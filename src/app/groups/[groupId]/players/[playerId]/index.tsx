import DeleteIcon from '@expo/material-symbols/delete.xml'
import { Effect, String } from 'effect'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Input,
  MaterialIcons,
  Pressable,
  SafeAreaView,
  Txt,
  View,
} from 'src/components'
import { RatingSlider } from 'src/components/custom/RatingSlider'
import { FormLabel } from 'src/components/derivative/FormLabel'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { useTheme } from 'src/contexts/Theme'
import { Position, Rating } from 'src/datatypes'
import { initialModalityPosition } from 'src/datatypes/Modality'
import type { Abbreviation } from 'src/datatypes/Position'
import { useActions, useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { runtime } from 'src/runtime'
import { getGroupModality } from 'src/slices/groups'
import { PlayerForm } from 'src/state/forms/player'
import type { Id } from 'src/utils/Entity'

export default function PlayerScreen() {
  return (
    <PlayerForm.Provider>
      <PlayerScreen_ />
    </PlayerForm.Provider>
  )
}

function PlayerScreen_() {
  const { groupId, playerId } = useLocalSearchParams<{
    groupId: Id
    playerId?: Id
  }>()
  const insets = useSafeAreaInsets()
  const appActions = useActions()
  const actions = PlayerForm.useActions()
  const { colors } = useTheme()
  const name = PlayerForm.useSelector(_ => _.name.value)

  useEffect(() => {
    if (playerId) {
      const player = appActions.groups.key(groupId)?.players.id(playerId)?.get()
      if (!player) return
      actions.setStateFromData(player)
    } else {
      const modality = appActions.getGroupModality({ group: { id: groupId } })
      if (!modality) return
      actions.positionAbbreviation.set(
        initialModalityPosition({ modality }).abbreviation,
      )
    }
  }, [groupId, playerId, appActions])

  return (
    <SafeAreaView flex={1} edges={['bottom', 'left', 'right']}>
      <Stack.Title>{t('Player')}</Stack.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          onPress={() => {
            if (playerId) {
              appActions.groups
                .key(groupId)
                ?.players.removeItem({ id: playerId })
            }
            router.back()
          }}
          icon={DeleteIcon}
        />
      </Stack.Toolbar>
      <KeyboardAwareScrollView
        mode="layout"
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{ flexGrow: 1 }}
        extraKeyboardSpace={-insets.bottom}
      >
        <View flex={1} p={4}>
          <NameField />
          <RatingField />
          <PositionField />
        </View>
      </KeyboardAwareScrollView>
      <KeyboardStickyView offset={{ opened: insets.bottom }}>
        <SolidButton
          onPress={() =>
            Effect.gen(function* () {
              const data = yield* actions.validate()
              yield* appActions.savePlayer({
                ...data,
                id: playerId ?? null,
                group: { id: groupId },
              })
              router.back()
            }).pipe(runtime.runPromiseExit)
          }
          isEnabled={String.isNonEmpty(name.trim())}
          p={16}
          round={0}
          color={colors.header}
        >
          <Txt>{t('Save')}</Txt>
        </SolidButton>
      </KeyboardStickyView>
    </SafeAreaView>
  )
}

const NameField = () => {
  const actions = PlayerForm.useActions()
  const name = PlayerForm.useSelector(_ => _.name.value)
  return (
    <View p={4}>
      <FormLabel>{t('Name')}</FormLabel>
      <Input
        placeholder={t('Ex: Jack')}
        value={name}
        onChange={actions.name.set}
        autoFocus={true}
      />
    </View>
  )
}

const RatingField = () => {
  const actions = PlayerForm.useActions()
  const { colors } = useTheme()
  const rating = PlayerForm.useSelector(_ => _.rating)
  return (
    <View p={4}>
      <FormLabel>{t('Rating')}</FormLabel>
      <Txt size={24} weight={700} color={colors.primary}>
        {Rating.toString(rating.value)}
      </Txt>
      <RatingSlider
        initialPercentage={rating.value / 10}
        step={0.05}
        onChange={actions.rating.setFromPercentage}
      />
    </View>
  )
}

const PositionField = () => {
  const { groupId } = useLocalSearchParams<{ groupId: Id }>()
  const positions = useSelector(
    _ => getGroupModality({ group: { id: groupId } })(_)?.positions ?? [],
  )
  return (
    <View p={4}>
      <FormLabel>{t('Position')}</FormLabel>
      <View>
        {positions.map(_ => (
          <PositionItem key={_.abbreviation} abbreviation={_.abbreviation} />
        ))}
      </View>
    </View>
  )
}

const PositionItem = ({ abbreviation }: { abbreviation: Abbreviation }) => {
  const { groupId } = useLocalSearchParams<{ groupId: Id }>()
  const actions = PlayerForm.useActions()
  const { colors } = useTheme()
  const position = useSelector(
    s =>
      getGroupModality({ group: { id: groupId } })(s)?.positions.find(
        _ => _.abbreviation === abbreviation,
      ) || null,
  )
  const isActive = PlayerForm.useSelector(
    s => s.positionAbbreviation.value === abbreviation,
  )
  if (!position) return null
  return (
    <Pressable
      key={position.abbreviation}
      onPress={() => actions.positionAbbreviation.set(position.abbreviation)}
      py={4}
      px={12}
      round={8}
      align="center"
      direction="row"
      bg={isActive ? colors.primary.setOpacityFactor(0.125) : undefined}
      rippleColor={colors.primary}
      rippleOpacity={0.1}
    >
      <View w={30}>
        {isActive ? (
          <MaterialIcons name="check" color={colors.primary} />
        ) : null}
      </View>
      <View minW={70} align="center">
        <View
          p={4}
          round={12}
          bg={colors.primary.setOpacityFactor(0.5)}
          minW={35}
        >
          <Txt align="center" size={18} weight={600} includeFontPadding={false}>
            {Position.toAbbreviationString(position)}
          </Txt>
        </View>
      </View>
      <Txt flex={1} align="center" weight={500}>
        {position.name}
      </Txt>
    </Pressable>
  )
}
