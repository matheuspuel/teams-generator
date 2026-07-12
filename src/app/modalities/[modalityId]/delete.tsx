import { router, useLocalSearchParams } from 'expo-router'
import { Row, Txt, TxtContext, View } from 'src/components'
import { CenterModal } from 'src/components/derivative/CenterModal'
import { GhostButton } from 'src/components/derivative/GhostButton'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { useActions, useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { getModality } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'

export default function DeleteModalityView() {
  const { modalityId } = useLocalSearchParams<{ modalityId: Id }>()
  const actions = useActions()
  const modality = useSelector(
    getModality({ _tag: 'CustomModality', id: modalityId }),
  )
  if (!modality || modality._tag !== 'CustomModality') return
  return (
    <CenterModal title={t('Delete modality')}>
      <View p={16}>
        {modality && (
          <TxtContext align="left">
            <Txt align="left">{`${t('Want to delete the modality')} `}</Txt>
            <Txt weight={600}>{modality.name}</Txt>
            <Txt>
              {`? ${t(
                'The positions of the players of this modality will be lost',
              )}.`}
            </Txt>
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
            actions.removeModality({ id: modality.id })
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
