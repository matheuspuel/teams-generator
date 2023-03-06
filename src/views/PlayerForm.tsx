import { get } from '@fp-ts/optic'
import { HeaderButtonProps } from '@react-navigation/elements'
import { $, $f, A, apply, constVoid, IOO, O, RA, Rec, RIO, Str, Tup } from 'fp'
import { sequenceS } from 'fp-ts/lib/Apply'
import { not } from 'fp-ts/Predicate'
import { useLayoutEffect } from 'react'
import { Input, Txt } from 'src/components/hyperscript/derivative'
import { MaterialIcons } from 'src/components/hyperscript/icons'
import {
  Pressable,
  ScrollView,
  View,
} from 'src/components/hyperscript/reactNative'
import { RatingList, RatingShow } from 'src/datatypes/Player'
import { PositionDict, PositionOrd } from 'src/datatypes/Position'
import { useEnv } from 'src/Env'
import { execute, replaceSApp } from 'src/redux'
import { createPlayer, deletePlayer, editPlayer } from 'src/redux/slices/groups'
import { PlayerFormLens } from 'src/redux/slices/playerForm'
import { UiLens } from 'src/redux/slices/ui'
import { useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { theme } from 'src/theme'

export const PlayerView = (props: RootStackScreenProps<'Player'>) => {
  const { navigation } = props
  const env = useEnv()
  const form = useAppSelector(get(PlayerFormLens))
  const id = useAppSelector(get(UiLens.at('selectedPlayerId')))
  const groupId = useAppSelector(get(UiLens.at('selectedGroupId')))

  useLayoutEffect(
    () =>
      navigation.setOptions({
        headerRight: $(
          sequenceS(O.Apply)({ id, groupId }),
          O.map(
            ({ id, groupId }) =>
              ({ tintColor }: HeaderButtonProps) =>
                Pressable({
                  style: ({ pressed }) => ({
                    marginRight: 4,
                    padding: 8,
                    borderRadius: 100,
                    backgroundColor: pressed
                      ? theme.colors.primary[700]
                      : undefined,
                  }),
                  onPress: $(
                    execute(deletePlayer({ groupId, playerId: id })),
                    RIO.chainFirstIOK(() => () => navigation.goBack()),
                  )(env),
                })([
                  MaterialIcons({ name: 'delete', color: tintColor, size: 24 }),
                ]),
          ),
          O.toUndefined,
        ),
      }),
    [],
  )

  return ScrollView({
    keyboardShouldPersistTaps: 'handled',
    contentContainerStyle: { flexGrow: 1 },
  })([
    View({ style: { flex: 1, padding: 4 } })([
      View({ style: { padding: 4 } })([
        Txt({
          style: {
            fontWeight: '500',
            color: theme.colors.gray[500],
            marginVertical: 4,
          },
        })('Nome'),
        Input({
          placeholder: 'Ex: Pedro',
          placeholderTextColor: theme.colors.gray[400],
          value: form.name,
          onChange: $f(
            replaceSApp(PlayerFormLens.at('name')),
            execute,
            apply(env),
          ),
          cursorColor: theme.colors.darkText,
          style: ({ isFocused }) => ({
            fontSize: 12,
            padding: 8,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderRadius: 4,
            borderColor: isFocused
              ? theme.colors.primary[600]
              : theme.colors.gray[300],
            backgroundColor: isFocused
              ? theme.colors.primary[600] + '1f'
              : undefined,
          }),
        }),
      ]),
      View({ style: { padding: 4 } })([
        Txt({
          style: {
            fontWeight: '500',
            color: theme.colors.gray[500],
            marginVertical: 4,
          },
        })('Posição'),
        View({ style: { flexDirection: 'row' } })(
          $(
            PositionDict,
            Rec.toEntries,
            A.map(Tup.fst),
            A.sort(PositionOrd),
            A.map(p =>
              Pressable({
                key: p,
                style: { flex: 1, alignItems: 'center' },
                onPress: $(
                  replaceSApp(PlayerFormLens.at('position'))(p),
                  execute,
                  apply(env),
                ),
              })([
                View({
                  style: {
                    aspectRatio: 1,
                    justifyContent: 'center',
                    padding: 4,
                    borderRadius: 9999,
                    backgroundColor:
                      form.position === p
                        ? theme.colors.primary[500]
                        : theme.colors.primary[500] + '3f',
                  },
                })([
                  Txt({
                    style: {
                      fontSize: 14,
                      textAlign: 'center',
                      color: theme.colors.lightText,
                    },
                  })(p),
                ]),
              ]),
            ),
          ),
        ),
      ]),
      View({ style: { padding: 4 } })([
        Txt({
          style: {
            fontWeight: '500',
            color: theme.colors.gray[500],
            marginVertical: 4,
          },
        })('Habilidade'),
        Txt({
          style: {
            textAlign: 'center',
            fontSize: 24,
            fontWeight: '700',
            color: theme.colors.primary[600],
          },
        })(RatingShow.show(form.rating)),
        View({ style: { flexDirection: 'row' } })(
          $(
            RatingList,
            RA.map(r =>
              View({ key: r, style: { flex: 1, height: 30 } })(
                form.rating === r
                  ? [
                      View({
                        style: {
                          alignSelf: 'center',
                          width: 200,
                          position: 'absolute',
                          bottom: -15,
                        },
                      })([
                        MaterialIcons({
                          name: 'arrow-drop-down',
                          style: {
                            fontSize: 60,
                            textAlign: 'center',
                            color: theme.colors.primary[600],
                          },
                        }),
                      ]),
                    ]
                  : [],
              ),
            ),
          ),
        ),
        View({ style: { flexDirection: 'row' } })(
          $(
            RatingList,
            RA.map(r =>
              View({ key: r, style: { flex: 1 } })([
                View({ style: { alignItems: 'center' } })([
                  View({
                    style: {
                      marginBottom: -1,
                      marginTop: r % 1 === 0 ? 0 : 4,
                      height: r % 1 === 0 ? 9 : 5,
                      width: 4,
                      backgroundColor: theme.colors.primary[500],
                      borderRadius: 10,
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                    },
                  })([]),
                  ...(r % 1 === 0
                    ? [
                        View({ style: { position: 'absolute', top: 10 } })([
                          Txt({
                            style: {
                              textAlign: 'center',
                              fontSize: 12,
                              color: theme.colors.primary[500],
                              fontWeight: '900',
                              width: 100,
                            },
                          })(r.toString()),
                        ]),
                      ]
                    : []),
                ]),
              ]),
            ),
          ),
        ),
        View({
          style: {
            height: 4,
            backgroundColor: theme.colors.primary[500],
            borderRadius: 10,
          },
        })([]),
        View({ style: { flexDirection: 'row' } })(
          $(
            RatingList,
            RA.map(r =>
              View({ key: r, style: { flex: 1 } })([
                Pressable({
                  onPress: $(
                    replaceSApp(PlayerFormLens.at('rating'))(r),
                    execute,
                    apply(env),
                  ),
                  style: { height: 70, marginTop: -35 },
                })([]),
              ]),
            ),
          ),
        ),
      ]),
    ]),
    Pressable({
      style: ({ pressed }) => ({
        padding: 12,
        backgroundColor: !form.name
          ? theme.colors.primary[600] + '5f'
          : pressed
          ? theme.colors.primary[800]
          : theme.colors.primary[600],
      }),
      onPress: $(
        form.name,
        IOO.fromPredicate(not(Str.isEmpty)),
        IOO.chainFirstIOK(() => () => navigation.goBack()),
        IOO.chainFirstIOK(() =>
          $(
            groupId,
            O.matchW(
              () => constVoid,
              groupId =>
                $(
                  id,
                  O.matchW(
                    () => createPlayer({ groupId, player: form })(env),
                    id =>
                      execute(editPlayer({ groupId, player: { ...form, id } }))(
                        env,
                      ),
                  ),
                ),
            ),
          ),
        ),
      ),
    })([
      Txt({
        style: {
          textAlign: 'center',
          color: !form.name ? theme.colors.white + '5f' : theme.colors.white,
        },
      })('Gravar'),
    ]),
  ])
}
