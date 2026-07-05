import DeleteIcon from '@expo/material-symbols/delete.xml'
import { Array, Option, Runtime, String, pipe } from 'effect'
import { Stack } from 'expo-router'
import {
  Input,
  KeyboardAvoidingView,
  MaterialIcons,
  Pressable,
  SafeAreaView,
  ScrollView,
  Txt,
  View,
} from 'src/components'
import { FormLabel } from 'src/components/derivative/FormLabel'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { Position, Rating } from 'src/datatypes'
import { Abbreviation } from 'src/datatypes/Position'
import {
  changePlayerName,
  changePlayerPosition,
  changePlayerRating,
  deletePlayer,
  savePlayer,
} from 'src/events/player'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { runtime } from 'src/runtime'
import { Colors } from 'src/services/Theme'
import { getActiveModality } from 'src/slices/groups'
import { RatingSlider } from '../../../../../components/custom/RatingSlider'

export default function PlayerScreen() {
  const name = useSelector(s => s.playerForm.name)
  return (
    <SafeAreaView flex={1} edges={['bottom']}>
      <KeyboardAvoidingView>
        <Stack.Title>{t('Player')}</Stack.Title>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            onPress={() => deletePlayer.pipe(Runtime.runPromiseExit(runtime))}
            icon={DeleteIcon}
          />
        </Stack.Toolbar>
        <ScrollView
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View flex={1} p={4}>
            <NameField name={name} />
            <RatingField />
            <PositionField />
          </View>
        </ScrollView>
        <SolidButton
          onPress={savePlayer}
          isEnabled={String.isNonEmpty(name.trim())}
          p={16}
          round={0}
          color={Colors.header}
        >
          <Txt>{t('Save')}</Txt>
        </SolidButton>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const NameField = ({ name }: { name: string }) => (
  <View p={4}>
    <FormLabel>{t('Name')}</FormLabel>
    <Input
      placeholder={t('Ex: Jack')}
      value={name}
      onChange={changePlayerName}
      autoFocus={true}
    />
  </View>
)

const RatingField = () => {
  const rating = useSelector(s => s.playerForm.rating)
  return (
    <View p={4}>
      <FormLabel>{t('Rating')}</FormLabel>
      <Txt size={24} weight={700} color={Colors.primary}>
        {Rating.toString(rating)}
      </Txt>
      <RatingSlider
        initialPercentage={rating / 10}
        step={0.05}
        onChange={changePlayerRating}
      />
    </View>
  )
}

const PositionField = () => {
  const positions = useSelector(s =>
    pipe(
      getActiveModality(s),
      Option.map(m => m.positions),
      Option.getOrElse(() => Array.empty()),
    ),
  )
  return (
    <View p={4}>
      <FormLabel>{t('Position')}</FormLabel>
      <View>
        {Array.map(positions, p => (
          <PositionItem key={p.abbreviation} abbreviation={p.abbreviation} />
        ))}
      </View>
    </View>
  )
}

const PositionItem = ({ abbreviation }: { abbreviation: Abbreviation }) => {
  const position = useSelector(s =>
    pipe(
      getActiveModality(s),
      Option.flatMap(m =>
        Array.findFirst(m.positions, _ => _.abbreviation === abbreviation),
      ),
    ),
  )
  const isActive = useSelector(
    s => s.playerForm.positionAbbreviation === abbreviation,
  )
  return Option.match(position, {
    onNone: () => null,
    onSome: position => (
      <Pressable
        key={position.abbreviation}
        onPress={changePlayerPosition(position.abbreviation)}
        py={4}
        px={12}
        round={8}
        align="center"
        direction="row"
        bg={isActive ? Colors.opacity(0.125)(Colors.primary) : undefined}
        rippleColor={Colors.primary}
        rippleOpacity={0.1}
      >
        <View w={30}>
          {isActive ? (
            <MaterialIcons name="check" color={Colors.primary} />
          ) : null}
        </View>
        <View minW={70} align="center">
          <View
            p={4}
            round={12}
            bg={Colors.opacity(0.5)(Colors.primary)}
            minW={35}
          >
            <Txt
              align="center"
              size={18}
              weight={600}
              includeFontPadding={false}
            >
              {Position.toAbbreviationString(position)}
            </Txt>
          </View>
        </View>
        <Txt flex={1} align="center" weight={500}>
          {position.name}
        </Txt>
      </Pressable>
    ),
  })
}
