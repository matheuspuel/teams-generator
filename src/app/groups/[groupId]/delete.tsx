import { router, useLocalSearchParams } from 'expo-router'
import { Row, Txt, TxtContext, View } from 'src/components'
import { CenterModal } from 'src/components/derivative/CenterModal'
import { GhostButton } from 'src/components/derivative/GhostButton'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { useActions, useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import type { Id } from 'src/utils/Entity'

export default function GroupDeleteScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: Id }>()
  const actions = useActions()
  const group = useSelector(_ => _.groups[groupId])
  return (
    <CenterModal title={t('Delete group')}>
      <View p={16}>
        {group && (
          <TxtContext align="left">
            <Txt align="left">{`${t('Want to delete the group')} `}</Txt>
            <Txt weight={600}>{group.name}</Txt>
            <Txt>{` ${t('and all its players?')}`}</Txt>
          </TxtContext>
        )}
      </View>
      <View borderWidthT={1} borderColor={Colors.opacity(0.375)(Colors.gray)} />
      <Row p={16} gap={8} justify="end">
        <GhostButton onPress={() => router.back()} color={Colors.error}>
          <Txt>{t('Cancel')}</Txt>
        </GhostButton>
        <SolidButton
          onPress={() => {
            actions.groups.key(groupId).remove()
            router.back()
            router.back()
            router.back()
          }}
          color={Colors.error}
        >
          <Txt>{t('Delete')}</Txt>
        </SolidButton>
      </Row>
    </CenterModal>
  )
}
