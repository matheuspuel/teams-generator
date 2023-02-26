import { MaterialIcons } from '@expo/vector-icons'
import { none } from 'fp-ts/lib/Option'
import { not } from 'fp-ts/lib/Predicate'
import { Button, FormControl, Icon, Input } from 'native-base'
import { useLayoutEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Player, Rating, RatingList, RatingShow } from 'src/datatypes/Player'
import { Position, PositionDict, PositionOrd } from 'src/datatypes/Position'
import { getPlayer, groupsSlice } from 'src/redux/slices/groups'
import { useAppDispatch, useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { theme } from 'src/theme'
import {
  A,
  constant,
  Eq,
  IO,
  IOO,
  O,
  pipe,
  RA,
  Rec,
  Str,
  Tup,
} from 'src/utils/fp-ts'

const makeSubSetter =
  <R extends object>(rootSetter: React.Dispatch<React.SetStateAction<R>>) =>
  <K extends keyof R>(key: K): React.Dispatch<R[K]> =>
  a =>
    rootSetter(p => ({ ...p, [key]: a }))

type Form = {
  name: string
  position: Position
  rating: Rating
}

const initialFormState: Form = {
  name: '',
  position: 'A',
  rating: 5,
}

const getFormFromData = ({ name, position, rating }: Player): Form => ({
  name,
  position,
  rating,
})

export const PlayerView = (props: RootStackScreenProps<'Player'>) => {
  const { navigation, route } = props
  const { id, groupId } = route.params
  const dispatch = useAppDispatch()
  const player = useAppSelector(
    pipe(
      id,
      O.matchW(
        () => () => none,
        id => getPlayer({ groupId, id }),
      ),
    ),
    O.getEq(Eq.eqStrict).equals,
  )
  const [form, setForm] = useState<Form>(
    pipe(player, O.match(constant(initialFormState), getFormFromData)),
  )

  const formSetters: {
    [k in keyof typeof form]: React.Dispatch<(typeof form)[k]>
  } = pipe(form, Rec.mapWithIndex(makeSubSetter(setForm)))

  useLayoutEffect(
    () =>
      navigation.setOptions({
        headerRight: O.isNone(id)
          ? undefined
          : ({ tintColor }) => (
              <Pressable
                style={({ pressed }) => ({
                  marginRight: 4,
                  padding: 8,
                  borderRadius: 100,
                  backgroundColor: pressed
                    ? theme.colors.primary[700]
                    : undefined,
                })}
                onPress={pipe(
                  groupsSlice.actions.deletePlayer({
                    groupId,
                    playerId: id.value,
                  }),
                  a => () => dispatch(a),
                  IO.chainFirst(() => () => navigation.goBack()),
                )}
              >
                <Icon
                  size="lg"
                  color={tintColor}
                  as={<MaterialIcons name="delete" />}
                />
              </Pressable>
            ),
      }),
    [],
  )

  return (
    <>
      <View style={{ flex: 1, padding: 4 }}>
        <FormControl p="1">
          <FormControl.Label>Nome</FormControl.Label>
          <Input
            placeholder="Ex: Pedro"
            value={form.name}
            onChangeText={formSetters.name}
          />
        </FormControl>
        <FormControl p="1">
          <FormControl.Label>Posição</FormControl.Label>
          <View style={{ flexDirection: 'row' }}>
            {pipe(
              PositionDict,
              Rec.toEntries,
              A.map(Tup.fst),
              A.sort(PositionOrd),
              A.map(p => (
                <Pressable
                  key={p}
                  style={{ flex: 1, alignItems: 'center' }}
                  onPress={() => formSetters.position(p)}
                >
                  <View
                    style={{
                      aspectRatio: 1,
                      justifyContent: 'center',
                      padding: 4,
                      borderRadius: 9999,
                      backgroundColor:
                        form.position === p
                          ? theme.colors.primary[500]
                          : theme.colors.primary[100],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        textAlign: 'center',
                        color: theme.colors.lightText,
                      }}
                    >
                      {p}
                    </Text>
                  </View>
                </Pressable>
              )),
            )}
          </View>
        </FormControl>
        <FormControl p="1">
          <FormControl.Label>Habilidade</FormControl.Label>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 24,
              fontWeight: '700',
              color: theme.colors.primary[600],
            }}
          >
            {RatingShow.show(form.rating)}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            {pipe(
              RatingList,
              RA.map(r => (
                <View key={r} style={{ flex: 1 }}>
                  {form.rating === r ? (
                    <View
                      style={{
                        alignSelf: 'center',
                        width: 200,
                        position: 'absolute',
                        bottom: -10,
                      }}
                    >
                      <MaterialIcons
                        name="arrow-drop-down"
                        color="black"
                        style={{
                          fontSize: 60,
                          textAlign: 'center',
                          color: theme.colors.primary[600],
                        }}
                      />
                    </View>
                  ) : null}
                  <Pressable
                    onPress={() => formSetters.rating(r)}
                    style={{
                      height: 70,
                      marginBottom: -45,
                      zIndex: 1,
                    }}
                  />
                  <View style={{ alignItems: 'center' }}>
                    <View
                      style={{
                        marginBottom: -1,
                        marginTop: r % 1 === 0 ? 0 : 4,
                        height: r % 1 === 0 ? 9 : 5,
                        width: 4,
                        backgroundColor: theme.colors.primary[500],
                        borderRadius: 10,
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                      }}
                    />
                    {r % 1 === 0 && (
                      <View style={{ position: 'absolute', top: 10 }}>
                        <Text
                          style={{
                            textAlign: 'center',
                            fontSize: 12,
                            color: theme.colors.primary[500],
                            fontWeight: '900',
                            width: 100,
                          }}
                        >
                          {r}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )),
            )}
          </View>
          <View
            style={{
              height: 4,
              backgroundColor: theme.colors.primary[500],
              borderRadius: 10,
            }}
          />
        </FormControl>
      </View>
      <Button
        rounded="none"
        isDisabled={!form.name}
        onPress={pipe(
          form.name,
          IOO.fromPredicate(not(Str.isEmpty)),
          IOO.chainFirstIOK(() => () => navigation.goBack()),
          IOO.map(() => id),
          IOO.chainFirstIOK(
            O.matchW(
              () => (): unknown =>
                dispatch(
                  groupsSlice.actions.addPlayer({ groupId, player: form }),
                ),
              id => (): unknown =>
                dispatch(
                  groupsSlice.actions.editPlayer({
                    groupId,
                    player: { ...form, id },
                  }),
                ),
            ),
          ),
          IOO.chainFirstIOK(() => () => setForm(initialFormState)),
        )}
      >
        Gravar
      </Button>
    </>
  )
}
