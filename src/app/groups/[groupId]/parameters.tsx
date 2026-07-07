import { Match, pipe, Schema } from 'effect'
import { router, useLocalSearchParams } from 'expo-router'
import { MaterialIcons, Pressable, Row, Txt, View } from 'src/components'
import { BorderlessButton } from 'src/components/derivative/BorderlessButton'
import { CenterModal } from 'src/components/derivative/CenterModal'
import { Checkbox } from 'src/components/derivative/Checkbox'
import { GhostButton } from 'src/components/derivative/GhostButton'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { useRuntime } from 'src/contexts/Runtime'
import { Parameters } from 'src/datatypes/Parameters'
import {
  decrementTeamsCount,
  generateResult,
  incrementTeamsCount,
  togglePositionParameter,
  toggleRatingParameter,
  toggleTeamsCountType,
} from 'src/events/group'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { Id } from 'src/utils/Entity'

export default function ParametersScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: Id }>()
  const runtime = useRuntime()
  const parameters = useSelector(
    s => s.parameters,
    Schema.equivalence(Parameters),
  )
  return (
    <CenterModal title={t('Parameters')} m={24}>
      <View p={16}>
        <Row align="center">
          <BorderlessButton
            onPress={() => decrementTeamsCount.pipe(runtime.runPromiseExit)}
          >
            <MaterialIcons name="remove" />
          </BorderlessButton>
          <Txt p={8} weight={600}>
            {pipe(
              parameters.teamsCountMethod,
              Match.valueTags({
                count: () => parameters.teamsCount.toString(),
                playersRequired: () => parameters.playersRequired.toString(),
              }),
            )}
          </Txt>
          <BorderlessButton
            onPress={() => incrementTeamsCount.pipe(runtime.runPromiseExit)}
          >
            <MaterialIcons name="add" />
          </BorderlessButton>
          <GhostButton
            onPress={() => toggleTeamsCountType.pipe(runtime.runPromiseExit)}
            flex={1}
            direction="row"
            align="center"
            p={4}
            pl={8}
            gap={4}
            color={Colors.text.normal}
          >
            <Txt flex={1}>
              {pipe(
                parameters.teamsCountMethod,
                Match.valueTags({
                  count: () => t('Number of teams'),
                  playersRequired: () => t('Fixed number of players per team'),
                }),
              )}
            </Txt>
            <MaterialIcons name="swap-horiz" size={20} color={Colors.primary} />
          </GhostButton>
        </Row>
        <Pressable
          onPress={() => togglePositionParameter.pipe(runtime.runPromiseExit)}
          direction="row"
          align="center"
          p={8}
          round={8}
          bg={Colors.opacity(0)(Colors.white)}
        >
          <Checkbox
            onToggle={() =>
              togglePositionParameter.pipe(runtime.runPromiseExit)
            }
            isSelected={parameters.position}
          />
          <Txt ml={8} size={14}>
            {t('Consider positions')}
          </Txt>
        </Pressable>
        <Pressable
          onPress={() => toggleRatingParameter.pipe(runtime.runPromiseExit)}
          direction="row"
          align="center"
          p={8}
          round={8}
          bg={Colors.opacity(0)(Colors.white)}
        >
          <Checkbox
            onToggle={() => toggleRatingParameter.pipe(runtime.runPromiseExit)}
            isSelected={parameters.rating}
          />
          <Txt ml={8} size={14}>
            {t('Consider rating')}
          </Txt>
        </Pressable>
      </View>
      <View borderWidthT={1} borderColor={Colors.opacity(0.375)(Colors.gray)} />
      <Row p={16} gap={8} justify="end">
        <GhostButton onPress={() => router.back()}>
          <Txt>{t('Cancel')}</Txt>
        </GhostButton>
        <SolidButton
          onPress={() =>
            generateResult({ group: { id: groupId } }).pipe(
              runtime.runPromiseExit,
            )
          }
        >
          <Txt>{t('Generate teams')}</Txt>
        </SolidButton>
      </Row>
    </CenterModal>
  )
}
