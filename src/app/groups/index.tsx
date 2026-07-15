import AddIcon from '@expo/material-symbols/add.xml'
import DownloadIcon from '@expo/material-symbols/download.xml'
import MoreVertIcon from '@expo/material-symbols/more_vert.xml'
import SportsSoccerIcon from '@expo/material-symbols/sports_soccer.xml'
import { Array, Data, Effect, flow, pipe, Record, Tuple } from 'effect'
import { router, Stack } from 'expo-router'
import { FlatList, Pressable, SafeAreaView, Txt, View } from 'src/components'
import { BannerAd } from 'src/components/custom/BannerAd'
import { Group } from 'src/datatypes'
import { extractGroupFromDocumentPicker } from 'src/export/group'
import { useActions, useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { runtime } from 'src/runtime'
import { SplashScreen } from 'src/services/SplashScreen'
import { Colors } from 'src/services/Theme'
import { getModality } from 'src/slices/groups'
import type { Id } from 'src/utils/Entity'

export default function GroupListScreen() {
  const actions = useActions()
  const groupsIds = useSelector(
    flow(
      s => s.groups,
      Record.toEntries,
      Array.map(Tuple.getSecond),
      Array.sort(Group.NameOrd),
      Array.map(_ => _.id),
      Data.array,
    ),
  )
  return (
    <SafeAreaView
      flex={1}
      edges={['bottom', 'left', 'right']}
      onLayout={() => SplashScreen.hide().pipe(runtime.runPromiseExit)}
    >
      <Stack.Title>{t('Groups')}</Stack.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          onPress={() => router.navigate(`/groups/create`)}
          icon={AddIcon}
        />
        <Stack.Toolbar.Menu icon={MoreVertIcon}>
          <Stack.Toolbar.MenuAction
            onPress={() =>
              extractGroupFromDocumentPicker().pipe(
                Effect.tap(_ => actions.importGroupData(_)),
                runtime.runPromiseExit,
              )
            }
            icon={DownloadIcon}
          >
            {t('Import group')}
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            onPress={() => router.navigate(`/modalities`)}
            icon={SportsSoccerIcon}
          >
            {t('Edit modalities')}
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <FlatList
        data={groupsIds}
        keyExtractor={id => id}
        renderItem={id => <Item id={id} />}
        ListEmptyComponent={
          <View flex={1} justify="center">
            <Txt size={16} color={Colors.opacity(0.625)(Colors.gray)}>
              {t('No groups registered')}
            </Txt>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1, p: 8, gap: 8 }}
        initialNumToRender={16}
      />
      <BannerAd />
    </SafeAreaView>
  )
}

const Item = ({ id }: { id: Id }) => {
  const group = useSelector(s =>
    pipe(
      s.groups[id] ?? null,
      g =>
        g &&
        Data.struct({
          name: g.name,
          modalityName: getModality(g.modality)(s)?.name ?? null,
        }),
    ),
  )
  if (!group) return null
  const { name, modalityName } = group
  return (
    <Pressable
      onPress={() => router.navigate(`/groups/${id}`)}
      p={12}
      round={8}
      shadow={1}
      bg={Colors.card}
    >
      <Txt
        numberOfLines={1}
        flex={1}
        align="left"
        weight={600}
        color={Colors.text.secondary}
        size={10}
      >
        {modalityName ?? '-'}
      </Txt>
      <Txt numberOfLines={1} flex={1} align="left" weight={600} size={16}>
        {name}
      </Txt>
    </Pressable>
  )
}
