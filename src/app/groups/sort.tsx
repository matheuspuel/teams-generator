import { Option } from 'effect'
import { MaterialCommunityIcons, Pressable, Txt, View } from 'src/components'
import { CenterModal } from 'src/components/derivative/CenterModal'
import { sortPlayersBy } from 'src/events/group'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { AppEvent } from 'src/runtime'
import { Colors } from 'src/services/Theme'

export default function SortGroupScreen() {
  const mainSort = useSelector(s => s.groupOrder[0])
  return (
    <CenterModal title={t('Sorting')}>
      <View roundB={8} overflow="hidden">
        <FilterButton
          name={t('Name')}
          onPress={sortPlayersBy.name}
          state={
            mainSort._tag === 'name'
              ? Option.some({ reverse: mainSort.reverse })
              : Option.none()
          }
        />
        <FilterButton
          name={t('Position')}
          onPress={sortPlayersBy.position}
          state={
            mainSort._tag === 'position'
              ? Option.some({ reverse: mainSort.reverse })
              : Option.none()
          }
        />
        <FilterButton
          name={t('Rating')}
          onPress={sortPlayersBy.rating}
          state={
            mainSort._tag === 'rating'
              ? Option.some({ reverse: mainSort.reverse })
              : Option.none()
          }
        />
        <FilterButton
          name={t('Active')}
          onPress={sortPlayersBy.active}
          state={
            mainSort._tag === 'active'
              ? Option.some({ reverse: mainSort.reverse })
              : Option.none()
          }
        />
        <FilterButton
          name={t('Date')}
          onPress={sortPlayersBy.date}
          state={
            mainSort._tag === 'date'
              ? Option.some({ reverse: mainSort.reverse })
              : Option.none()
          }
        />
      </View>
    </CenterModal>
  )
}

const FilterButton = (props: {
  state: Option.Option<{ reverse: boolean }>
  onPress: AppEvent
  name: string
}) => (
  <Pressable direction="row" align="center" p={16} onPress={props.onPress}>
    <View w={36}>
      {Option.match(props.state, {
        onNone: () => null,
        onSome: ({ reverse }) => (
          <MaterialCommunityIcons
            name={reverse ? 'sort-descending' : 'sort-ascending'}
            color={Colors.primary}
          />
        ),
      })}
    </View>
    <Txt flex={1} align="left">
      {props.name}
    </Txt>
  </Pressable>
)
