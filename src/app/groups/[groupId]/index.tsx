import AddIcon from '@expo/material-symbols/add.xml'
import CheckBoxIcon from '@expo/material-symbols/check_box.xml'
import DeleteIcon from '@expo/material-symbols/delete.xml'
import EditIcon from '@expo/material-symbols/edit.xml'
import MoreVertIcon from '@expo/material-symbols/more_vert.xml'
import SortIcon from '@expo/material-symbols/sort.xml'
import UploadIcon from '@expo/material-symbols/upload.xml'
import { Array, Data, Option, pipe } from 'effect'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { FlatList, Pressable, SafeAreaView, Txt, View } from 'src/components'
import { Checkbox } from 'src/components/derivative/Checkbox'
import { PreRender } from 'src/components/derivative/PreRender'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { useTheme } from 'src/contexts/Theme'
import { GroupOrder, Position, Rating } from 'src/datatypes'
import { useActions, useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { runtime } from 'src/runtime'
import { getGroupModality, getPlayer } from 'src/slices/groups'
import type { Id } from 'src/utils/Entity'

export default function GroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: Id }>()
  const actions = useActions()
  const { colors } = useTheme()
  const playersIds = useSelector(_ =>
    Option.gen(function* () {
      const group = yield* Option.fromNullable(_.groups[groupId])
      const modality = yield* Option.fromNullable(
        getGroupModality({ group: { id: groupId } })(_),
      )
      return Array.sort(
        group.players,
        GroupOrder.toOrder(_.groupOrder)({ modality }),
      ).map(_ => _.id)
    }).pipe(
      Option.getOrElse(() => []),
      Data.array,
    ),
  )
  return (
    <SafeAreaView flex={1} edges={['bottom', 'left', 'right']}>
      <Stack.Title>{t('Group')}</Stack.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          onPress={() => router.navigate(`/groups/${groupId}/players/create`)}
          icon={AddIcon}
        />
        <Stack.Toolbar.Menu icon={MoreVertIcon}>
          <Stack.Toolbar.MenuAction
            onPress={actions.groups.key(groupId)?.players.toggleAll}
            icon={CheckBoxIcon}
          >
            {t('Select all')}
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            onPress={() => router.navigate(`/groups/sort`)}
            icon={SortIcon}
          >
            {t('Sort')}
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            onPress={() =>
              actions.exportGroup({ id: groupId }).pipe(runtime.runPromiseExit)
            }
            icon={UploadIcon}
          >
            {t('Export group')}
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            onPress={() => router.navigate(`/groups/${groupId}/edit`)}
            icon={EditIcon}
          >
            {t('Edit group')}
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            onPress={() => router.navigate(`/groups/${groupId}/delete`)}
            icon={DeleteIcon}
          >
            {t('Delete group')}
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <PreRender
        initial={
          <View flex={1} p={8} gap={8}>
            {Array.makeBy(3, i => (
              <View
                key={i}
                round={8}
                bg={colors.gray.setOpacityFactor(0.125)}
                h={40}
              />
            ))}
          </View>
        }
      >
        <FlatList
          data={playersIds}
          keyExtractor={id => id}
          renderItem={id => <Item groupId={groupId} playerId={id} />}
          ListEmptyComponent={
            <View flex={1} justify="center">
              <Txt size={16} color={colors.gray.setOpacityFactor(0.625)}>
                {t('No players registered')}
              </Txt>
            </View>
          }
          contentContainerStyle={{ flexGrow: 1, p: 8, gap: 8 }}
          initialNumToRender={16}
        />
      </PreRender>
      <ShuffleButton />
    </SafeAreaView>
  )
}

const Item = ({ groupId, playerId }: { groupId: Id; playerId: Id }) => {
  const actions = useActions()
  const { colors } = useTheme()
  const player = useSelector(s =>
    pipe(
      getPlayer({ group: { id: groupId }, player: { id: playerId } })(s),
      player =>
        player &&
        Data.struct({
          ...player,
          position: pipe(getGroupModality({ group: { id: groupId } })(s), m =>
            m == null
              ? null
              : (m.positions.find(
                  p => p.abbreviation === player.positionAbbreviation,
                ) ?? null),
          ),
        }),
    ),
  )
  if (!player) return null
  const { active, name, position, rating } = player
  return (
    <Pressable
      onPress={() => router.navigate(`/groups/${groupId}/players/${playerId}`)}
      direction="row"
      align="center"
      gap={8}
      round={8}
      shadow={1}
      bg={colors.card}
    >
      <Checkbox
        onToggle={() =>
          actions.groups.key(groupId)?.players.id(playerId)?.active.toggle()
        }
        isSelected={active}
        m={8}
        mr={-8}
      />
      <View
        p={4}
        round={12}
        bg={colors.primary.setOpacityFactor(0.5)}
        minW={35}
      >
        <Txt align="center" size={18} weight={600} includeFontPadding={false}>
          {position ? Position.toAbbreviationString(position) : '-'}
        </Txt>
      </View>
      <Txt size={18} weight={600}>
        {Rating.toString(rating)}
      </Txt>
      <Txt my={8} numberOfLines={1}>
        {name}
      </Txt>
    </Pressable>
  )
}

const ShuffleButton = () => {
  const { groupId } = useLocalSearchParams<{ groupId: Id }>()
  const { colors } = useTheme()
  const numSelected = useSelector(
    _ => (_.groups[groupId]?.players ?? []).filter(_ => _.active).length,
  )
  return (
    <SolidButton
      onPress={() => router.navigate(`/groups/${groupId}/parameters`)}
      p={16}
      round={0}
      color={colors.header}
      isEnabled={numSelected > 1}
    >
      <Txt>{t('Generate teams')}</Txt>
      <Txt size={12}>
        {pipe(numSelected, n =>
          n === 0
            ? `(${t('No players selected')})`
            : n === 1
              ? `(${t('1 player selected')})`
              : `(${n.toString()} ${t('players selected')})`,
        )}
      </Txt>
    </SolidButton>
  )
}
