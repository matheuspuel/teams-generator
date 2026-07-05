import { Effect, Option, pipe } from 'effect'
import { router } from 'expo-router'
import { Row, Txt, TxtContext, View } from 'src/components'
import { CenterModal } from 'src/components/derivative/CenterModal'
import { GhostButton } from 'src/components/derivative/GhostButton'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { removeModality } from 'src/events/modality'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { getModality } from 'src/slices/groups'

export default function DeleteModalityView() {
  const modality = useSelector(s =>
    pipe(
      s.modalityForm.id,
      Option.flatMap(id => getModality({ _tag: 'CustomModality', id })(s)),
    ),
  )
  return (
    <CenterModal title={t('Delete modality')}>
      <View p={16}>
        {Option.match(modality, {
          onNone: () => null,
          onSome: m => (
            <TxtContext align="left">
              <Txt align="left">{`${t('Want to delete the modality')} `}</Txt>
              <Txt weight={600}>{m.name}</Txt>
              <Txt>
                {`? ${t(
                  'The positions of the players of this modality will be lost',
                )}.`}
              </Txt>
            </TxtContext>
          ),
        })}
      </View>
      <View borderWidthT={1} borderColor={Colors.opacity(0.375)(Colors.gray)} />
      <Row p={16} gap={8} justify="end">
        <GhostButton
          onPress={Effect.sync(() => router.back())}
          color={Colors.error}
        >
          <Txt>{t('Cancel')}</Txt>
        </GhostButton>
        <SolidButton onPress={removeModality} color={Colors.error}>
          <Txt>{t('Delete')}</Txt>
        </SolidButton>
      </Row>
    </CenterModal>
  )
}
