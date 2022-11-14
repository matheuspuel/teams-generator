import { none } from 'fp-ts/lib/Option'
import { Button, Flex, FormControl, Input, Pressable, Text } from 'native-base'
import { useState } from 'react'
import { Player, Rating, RatingList } from 'src/datatypes/Player'
import { Position, PositionDict, PositionOrd } from 'src/datatypes/Position'
import { getPlayer, groupsSlice } from 'src/redux/slices/groups'
import { useAppDispatch, useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { A, constant, Eq, O, pipe, RA, Rec, Tup } from 'src/utils/fp-ts'

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
        onPress={() => {
          if (!form.name) return
          navigation.goBack()
          if (O.isSome(id)) {
            dispatch(
              groupsSlice.actions.editPlayer({
                groupId,
                player: { ...form, id: id.value },
              }),
            )
          } else {
            dispatch(groupsSlice.actions.addPlayer({ groupId, player: form }))
          }
          setForm(initialFormState)
        }}
      >
        Gravar
      </Button>
    </>
  )
}
