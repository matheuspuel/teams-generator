import { Effect, Option, pipe } from 'effect'
import { router } from 'expo-router'
import { Row, Txt, TxtContext, View } from 'src/components'
import { CenterModal } from 'src/components/derivative/CenterModal'
import { GhostButton } from 'src/components/derivative/GhostButton'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { deleteGroup } from 'src/events/group'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { getSelectedGroup } from 'src/slices/groups'

export default function GroupDeleteScreen() {
  const group = useSelector(getSelectedGroup)
  return (
    <CenterModal title={t('Delete group')}>
      <View p={16}>
        {pipe(
          group,
          Option.map(g => (
            <TxtContext align="left">
              <Txt align="left">{`${t('Want to delete the group')} `}</Txt>
              <Txt weight={600}>{g.name}</Txt>
              <Txt>{` ${t('and all its players?')}`}</Txt>
            </TxtContext>
          )),
          Option.getOrNull,
        )}
      </View>
      <View borderWidthT={1} borderColor={Colors.opacity(0.375)(Colors.gray)} />
      <Row p={16} gap={8} justify="end">
        <GhostButton
          onPress={Effect.sync(() => router.back())}
          color={Colors.error}
        >
          <Txt>{t('Cancel')}</Txt>
        </GhostButton>
        <SolidButton onPress={deleteGroup} color={Colors.error}>
          <Txt>{t('Delete')}</Txt>
        </SolidButton>
      </Row>
    </CenterModal>
  )
}
