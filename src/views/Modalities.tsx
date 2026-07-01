import { Data, Option } from 'effect'
import {
  FlatList,
  Header,
  MaterialIcons,
  Pressable,
  Txt,
  View,
} from 'src/components'
import { HeaderButton } from 'src/components/derivative/HeaderButton'
import { HeaderButtonRow } from 'src/components/derivative/HeaderButtonRow'
import { Modality } from 'src/datatypes'
import { staticModalities } from 'src/datatypes/Modality'
import { back } from 'src/events/core'
import { newModality, openModality } from 'src/events/modality'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { getModality } from 'src/slices/groups'

export const ModalitiesView = () => {
  const modalities = useSelector(s =>
    Data.array([...s.customModalities, ...staticModalities]),
  )
  return (
    <View flex={1}>
      <ScreenHeader />
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

const ScreenHeader = () => (
  <View>
    <Header
      title={t('Modalities')}
      headerLeft={
        <HeaderButtonRow>
          <HeaderButton
            onPress={back}
            icon={<MaterialIcons name="arrow-back" />}
          />
        </HeaderButtonRow>
      }
      headerRight={
        <HeaderButtonRow>
          <HeaderButton
            onPress={newModality}
            icon={<MaterialIcons name="add" />}
          />
        </HeaderButtonRow>
      }
    />
  </View>
)

const Item = ({ modality }: { modality: Modality.Reference }) => {
  const name = useSelector(s =>
    getModality(modality)(s).pipe(Option.map(m => m.name)),
  )
  return Option.match(name, {
    onNone: () => <></>,
    onSome: name => (
      <Pressable
        onPress={openModality(modality)}
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
    ),
  })
}
