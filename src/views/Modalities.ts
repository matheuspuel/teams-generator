import { Data, O } from 'fp'
import {
  FlatList,
  Header,
  MaterialIcons,
  Nothing,
  Pressable,
  Txt,
  View,
} from 'src/components'
import { HeaderButton } from 'src/components/derivative/HeaderButton'
import { HeaderButtonRow } from 'src/components/derivative/HeaderButtonRow'
import { memoized, memoizedConst } from 'src/components/hyperscript'
import { Modality } from 'src/datatypes'
import { staticModalities } from 'src/datatypes/Modality'
import { appEvents } from 'src/events'
import { useSelector } from 'src/hooks/useSelector'
import { Colors } from 'src/services/Theme'
import { getModality } from 'src/slices/groups'

const on = appEvents.modality

export const ModalitiesView = memoizedConst('ModalitiesView')(() => {
  const modalities = useSelector(s =>
    Data.array([...s.customModalities, ...staticModalities]),
  )
  return View({ flex: 1 })([
    ScreenHeader,
    FlatList({
      data: modalities,
      keyExtractor: m => m.id,
      renderItem: Item,
      ListEmptyComponent: View({ flex: 1, justify: 'center' })([
        Txt({ size: 16, color: Colors.gray.$3 })(
          'Nenhuma modalidade cadastrada',
        ),
      ]),
      contentContainerStyle: { flexGrow: 1, p: 8, gap: 8 },
      initialNumToRender: 16,
    }),
  ])
})

const ScreenHeader = memoizedConst('ScreenHeader')(() =>
  View({ bg: Colors.white })([
    Header({
      title: 'Modalidades',
      headerStyle: { backgroundColor: Colors.primary.$5 },
      headerTitleStyle: { color: Colors.text.light },
      headerLeft: HeaderButtonRow([
        HeaderButton({
          onPress: appEvents.back(),
          icon: MaterialIcons({ name: 'arrow-back' }),
        }),
      ]),
      headerRight: HeaderButtonRow([
        HeaderButton({
          onPress: on.new(),
          icon: MaterialIcons({ name: 'add' }),
        }),
      ]),
    }),
  ]),
)

const Item = memoized('Modality')((modality: Modality.Reference) => {
  const name = useSelector(s =>
    getModality(modality)(s).pipe(O.map(m => m.name)),
  )
  return O.match(name, {
    onNone: () => Nothing,
    onSome: name =>
      Pressable({
        onPress: on.open(modality),
        direction: 'row',
        align: 'center',
        p: 12,
        round: 8,
        shadow: 1,
        bg: Colors.white,
        isEnabled: modality._tag === 'CustomModality',
      })([
        View({ minW: 30 })([]),
        Txt({
          flex: 1,
          color: Colors.text.dark,
          numberOfLines: 1,
          size: 16,
          weight: 500,
        })(name),
        View({ minW: 30, h: 24, align: 'end' })([
          modality._tag === 'CustomModality'
            ? Nothing
            : MaterialIcons({ name: 'lock', color: Colors.gray.$2 }),
        ]),
      ]),
  })
})
