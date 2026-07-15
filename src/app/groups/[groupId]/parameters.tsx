import { Match, pipe, Schema } from 'effect'
import { router, useLocalSearchParams } from 'expo-router'
import { MaterialIcons, Pressable, Row, Txt, View } from 'src/components'
import { BorderlessButton } from 'src/components/derivative/BorderlessButton'
import { CenterModal } from 'src/components/derivative/CenterModal'
import { Checkbox } from 'src/components/derivative/Checkbox'
import { GhostButton } from 'src/components/derivative/GhostButton'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { useRuntime } from 'src/contexts/Runtime'
import { useTheme } from 'src/contexts/Theme'
import { Parameters } from 'src/datatypes'
import { useActions, useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import type { Id } from 'src/utils/Entity'

export default function ParametersScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: Id }>()
  const actions = useActions()
  const runtime = useRuntime()
  const { colors } = useTheme()
  const parameters = useSelector(
    s => s.parameters,
    Schema.equivalence(Parameters.Parameters),
  )
  return (
    <CenterModal title={t('Parameters')} m={24}>
      <View p={16}>
        <Row align="center">
          <BorderlessButton onPress={actions.parameters.decrementMethod}>
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
          <BorderlessButton onPress={actions.parameters.incrementMethod}>
            <MaterialIcons name="add" />
          </BorderlessButton>
          <GhostButton
            onPress={actions.parameters.teamsCountMethod.toggle}
            flex={1}
            direction="row"
            align="center"
            p={4}
            pl={8}
            gap={4}
            color={colors.text.normal}
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
            <MaterialIcons name="swap-horiz" size={20} color={colors.primary} />
          </GhostButton>
        </Row>
        <Pressable
          onPress={() => actions.parameters.position.update(_ => !_)}
          direction="row"
          align="center"
          p={8}
          round={8}
          bg={colors.white.setOpacityFactor(0)}
        >
          <Checkbox
            onToggle={() => actions.parameters.position.update(_ => !_)}
            isSelected={parameters.position}
          />
          <Txt ml={8} size={14}>
            {t('Consider positions')}
          </Txt>
        </Pressable>
        <Pressable
          onPress={() => actions.parameters.rating.update(_ => !_)}
          direction="row"
          align="center"
          p={8}
          round={8}
          bg={colors.white.setOpacityFactor(0)}
        >
          <Checkbox
            onToggle={() => actions.parameters.rating.update(_ => !_)}
            isSelected={parameters.rating}
          />
          <Txt ml={8} size={14}>
            {t('Consider rating')}
          </Txt>
        </Pressable>
      </View>
      <View
        borderWidthT={1}
        borderColor={colors.gray.setOpacityFactor(0.375)}
      />
      <Row p={16} gap={8} justify="end">
        <GhostButton onPress={() => router.back()}>
          <Txt>{t('Cancel')}</Txt>
        </GhostButton>
        <SolidButton
          onPress={() => {
            router.back()
            router.navigate(`/groups/${groupId}/result`)
            actions
              .generateResult({ group: { id: groupId } })
              .pipe(runtime.runPromiseExit)
          }}
        >
          <Txt>{t('Generate teams')}</Txt>
        </SolidButton>
      </Row>
    </CenterModal>
  )
}
