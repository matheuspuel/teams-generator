import { MaterialIcons } from '@expo/vector-icons'
import { none } from 'fp-ts/lib/Option'
import { not } from 'fp-ts/lib/Predicate'
import {
  Button,
  Flex,
  FormControl,
  Icon,
  Input,
  Pressable,
  Text,
} from 'native-base'
import { useLayoutEffect, useState } from 'react'
import { Player, Rating, RatingList } from 'src/datatypes/Player'
import { Position, PositionDict, PositionOrd } from 'src/datatypes/Position'
import { getPlayer, groupsSlice } from 'src/redux/slices/groups'
import { useAppDispatch, useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
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
    [k in keyof typeof form]: React.Dispatch<typeof form[k]>
  } = pipe(form, Rec.mapWithIndex(makeSubSetter(setForm)))

  useLayoutEffect(
    () =>
      navigation.setOptions({
        headerRight: O.isNone(id)
          ? undefined
          : ({ tintColor }) => (
              <Pressable
                mr="1"
                p="2"
                rounded="full"
                _pressed={{ bg: 'primary.700' }}
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
      <Flex flex={1} p="1">
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
          <Flex direction="row">
            {pipe(
              PositionDict,
              Rec.toEntries,
              A.map(Tup.fst),
              A.sort(PositionOrd),
              A.map(p => (
                <Pressable
                  key={p}
                  flex={1}
                  alignItems="center"
                  onPress={() => formSetters.position(p)}
                >
                  <Flex
                    justify="center"
                    p="1"
                    style={{ aspectRatio: 1 }}
                    rounded="full"
                    bg={form.position === p ? 'primary.500' : 'primary.100'}
                  >
                    <Text fontSize="sm" textAlign="center" color="lightText">
                      {p}
                    </Text>
                  </Flex>
                </Pressable>
              )),
            )}
          </Flex>
        </FormControl>
        <FormControl p="1">
          <FormControl.Label>Habilidade</FormControl.Label>
          <Flex direction="row">
            {pipe(
              RatingList,
              RA.map(r => (
                <Pressable
                  key={r}
                  flex={1}
                  alignItems="center"
                  onPress={() => formSetters.rating(r)}
                >
                  <Flex
                    justify="center"
                    p="1"
                    style={{ aspectRatio: 1 }}
                    rounded="full"
                    bg={form.rating === r ? 'primary.500' : 'primary.100'}
                  >
                    <Text fontSize="2xs" textAlign="center" color="lightText">
                      {r}
                    </Text>
                  </Flex>
                </Pressable>
              )),
            )}
          </Flex>
        </FormControl>
      </Flex>
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
