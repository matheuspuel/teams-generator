import { MaterialCommunityIcons, Pressable, Txt, View } from 'src/components'
import { CenterModal } from 'src/components/derivative/CenterModal'
import { useRuntime } from 'src/contexts/Runtime'
import { sortPlayersBy } from 'src/events/group'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'

export default function SortGroupScreen() {
  const runtime = useRuntime()
  const mainSort = useSelector(s => s.groupOrder[0])
  return (
    <CenterModal title={t('Sorting')}>
      <View roundB={8} overflow="hidden">
        <FilterButton
          name={t('Name')}
          onPress={() => sortPlayersBy.name.pipe(runtime.runPromiseExit)}
          state={mainSort._tag === 'name' ? mainSort : null}
        />
        <FilterButton
          name={t('Position')}
          onPress={() => sortPlayersBy.position.pipe(runtime.runPromiseExit)}
          state={mainSort._tag === 'position' ? mainSort : null}
        />
        <FilterButton
          name={t('Rating')}
          onPress={() => sortPlayersBy.rating.pipe(runtime.runPromiseExit)}
          state={mainSort._tag === 'rating' ? mainSort : null}
        />
        <FilterButton
          name={t('Active')}
          onPress={() => sortPlayersBy.active.pipe(runtime.runPromiseExit)}
          state={mainSort._tag === 'active' ? mainSort : null}
        />
        <FilterButton
          name={t('Date')}
          onPress={() => sortPlayersBy.date.pipe(runtime.runPromiseExit)}
          state={mainSort._tag === 'date' ? mainSort : null}
        />
      </View>
    </CenterModal>
  )
}

const FilterButton = (props: {
  state: { reverse: boolean } | null
  onPress: () => void
  name: string
}) => (
  <Pressable direction="row" align="center" p={16} onPress={props.onPress}>
    <View w={36}>
      {props.state === null ? null : (
        <MaterialCommunityIcons
          name={props.state.reverse ? 'sort-descending' : 'sort-ascending'}
          color={Colors.primary}
        />
      )}
    </View>
    <Txt flex={1} align="left">
      {props.name}
    </Txt>
  </Pressable>
)
