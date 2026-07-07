import AddIcon from '@expo/material-symbols/add.xml'
import { Data, Effect } from 'effect'
import { router, Stack } from 'expo-router'
import { FlatList, MaterialIcons, Pressable, Txt, View } from 'src/components'
import { useRuntime } from 'src/contexts/Runtime'
import { Modality } from 'src/datatypes'
import { staticModalities } from 'src/datatypes/Modality'
import { newModality, openModality } from 'src/events/modality'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { getModality } from 'src/slices/groups'

export default function ModalityListScreen() {
  const runtime = useRuntime()
  const modalities = useSelector(s =>
    Data.array([...s.customModalities, ...staticModalities]),
  )
  return (
    <View flex={1}>
      <Stack.Title>{t('Modalities')}</Stack.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          onPress={() =>
            newModality.pipe(
              Effect.tap(() => router.navigate(`/modalities/create`)),
              runtime.runPromiseExit,
            )
          }
          icon={AddIcon}
        />
      </Stack.Toolbar>
      <FlatList
        data={modalities}
        keyExtractor={m => m.id}
        renderItem={m => <Item modality={m} />}
        ListEmptyComponent={
          <View flex={1} justify="center">
            <Txt size={16} color={Colors.opacity(0.625)(Colors.gray)}>
              {t('No modalities registered')}
            </Txt>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1, p: 8, gap: 8 }}
        initialNumToRender={16}
      />
    </View>
  )
}

const Item = ({ modality }: { modality: Modality.Reference }) => {
  const runtime = useRuntime()
  const name = useSelector(s => getModality(modality)(s)?.name ?? null)
  if (!name) return null
  return (
    <Pressable
      onPress={() => openModality(modality).pipe(runtime.runPromiseExit)}
      direction="row"
      align="center"
      p={12}
      round={8}
      shadow={1}
      bg={Colors.card}
      isEnabled={modality._tag === 'CustomModality'}
    >
      <View minW={30} />
      <Txt flex={1} numberOfLines={1} size={16} weight={500}>
        {name}
      </Txt>
      <View minW={30} h={24} align="end">
        {modality._tag === 'CustomModality' ? null : (
          <MaterialIcons
            name="lock"
            color={Colors.opacity(0.375)(Colors.gray)}
          />
        )}
      </View>
    </Pressable>
  )
}
