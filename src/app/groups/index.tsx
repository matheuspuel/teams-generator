import AddIcon from '@expo/material-symbols/add.xml'
import DownloadIcon from '@expo/material-symbols/download.xml'
import MoreVertIcon from '@expo/material-symbols/more_vert.xml'
import SportsSoccerIcon from '@expo/material-symbols/sports_soccer.xml'
import { Array, Data, flow, Option, pipe, Record, Runtime, Tuple } from 'effect'
import { router, Stack } from 'expo-router'
import { FlatList, Pressable, Txt, View } from 'src/components'
import { BannerAd } from 'src/components/custom/BannerAd'
import { Group } from 'src/datatypes'
import { hideSplashScreen } from 'src/events/core'
import { openGroup, startCreateGroup } from 'src/events/groups'
import { importGroupFromDocumentPicker } from 'src/export/group'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { runtime } from 'src/runtime'
import { Colors } from 'src/services/Theme'
import { getGroupById, getModality } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'

export default function GroupListScreen() {
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
    <View flex={1} onLayout={hideSplashScreen}>
      <Stack.Title>{t('Groups')}</Stack.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          onPress={() => startCreateGroup.pipe(Runtime.runPromiseExit(runtime))}
          icon={AddIcon}
        />
        <Stack.Toolbar.Menu icon={MoreVertIcon}>
          <Stack.Toolbar.MenuAction
            onPress={() =>
              importGroupFromDocumentPicker().pipe(
                Runtime.runPromiseExit(runtime),
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
    </View>
  )
}

const Item = ({ id }: { id: Id }) => {
  const group = useSelector(s =>
    pipe(
      getGroupById(id)(s),
      Option.map(({ name, modality }) =>
        Data.struct({
          name,
          modality: pipe(
            getModality(modality)(s),
            Option.map(_ => _.name),
          ),
        }),
      ),
    ),
  )
  return Option.match(group, {
    onNone: () => <></>,
    onSome: ({ name, modality }) => (
      <Pressable
        onPress={openGroup(id)}
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
          {Option.getOrElse(modality, () => '-')}
        </Txt>
        <Txt numberOfLines={1} flex={1} align="left" weight={600} size={16}>
          {name}
        </Txt>
      </Pressable>
    ),
  })
}
