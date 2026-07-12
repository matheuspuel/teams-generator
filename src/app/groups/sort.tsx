import { router } from 'expo-router'
import { MaterialCommunityIcons, Pressable, Txt, View } from 'src/components'
import { CenterModal } from 'src/components/derivative/CenterModal'
import { GroupOrderType } from 'src/datatypes/GroupOrder'
import { useActions, useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'

export default function SortGroupScreen() {
  return (
    <CenterModal title={t('Sorting')}>
      <View roundB={8} overflow="hidden">
        <FilterButton name={t('Name')} option="name" />
        <FilterButton name={t('Position')} option="position" />
        <FilterButton name={t('Rating')} option="rating" />
        <FilterButton name={t('Active')} option="active" />
        <FilterButton name={t('Date')} option="date" />
      </View>
    </CenterModal>
  )
}

const FilterButton = (props: { option: GroupOrderType; name: string }) => {
  const actions = useActions()
  const mainSort = useSelector(s => s.groupOrder[0])
  return (
    <Pressable
      direction="row"
      align="center"
      p={16}
      onPress={() => {
        actions.groupOrder.select(props.option)
        router.back()
      }}
    >
      <View w={36}>
        {mainSort._tag === props.option ? (
          <MaterialCommunityIcons
            name={mainSort.reverse ? 'sort-descending' : 'sort-ascending'}
            color={Colors.primary}
          />
        ) : null}
      </View>
      <Txt flex={1} align="left">
        {props.name}
      </Txt>
    </Pressable>
  )
}
