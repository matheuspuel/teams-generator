import { Option } from '@fp-ts/core/Option'
import { $, $f, A, O, RA, Rec, RIO, Str, Tup } from 'fp'
import { sequenceS } from 'fp-ts/lib/Apply'
import { not } from 'fp-ts/Predicate'
import { Input } from 'src/components/basic/Input'
import { Pressable } from 'src/components/basic/Pressable'
import { Txt } from 'src/components/hyperscript/derivative'
import { MaterialIcons } from 'src/components/hyperscript/icons'
import { ScrollView, View } from 'src/components/hyperscript/reactNative'
import { Header } from 'src/components/react-navigation/Header'
import { HeaderBackButton } from 'src/components/react-navigation/HeaderBackButton'
import { RatingList, RatingShow } from 'src/datatypes/Player'
import { PositionDict, PositionOrd } from 'src/datatypes/Position'
import { execute, replaceSApp } from 'src/redux'
import { createPlayer, deletePlayer, editPlayer } from 'src/redux/slices/groups'
import { PlayerForm, PlayerFormLens } from 'src/redux/slices/playerForm'
import { goBack } from 'src/redux/slices/routes'
import { theme } from 'src/theme'
import { Id } from 'src/utils/Entity'

export const PlayerView = ({
  form,
  id,
  groupId,
}: {
  form: PlayerForm
  id: Option<Id>
  groupId: Option<Id>
}) =>
  ScrollView({
    keyboardShouldPersistTaps: 'handled',
    contentContainerStyle: { flexGrow: 1 },
  })([
    View({ style: { backgroundColor: theme.colors.white } })([
      Header({
        title: 'Jogador',
        headerStyle: { backgroundColor: theme.colors.primary[600] },
        headerTitleStyle: { color: theme.colors.lightText },
        headerLeft: HeaderBackButton({
          onPress: goBack,
          tintColor: theme.colors.lightText,
        }),
        headerRight: $(
          sequenceS(O.Apply)({ id, groupId }),
          O.map(({ id, groupId }) =>
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
                RIO.chainFirst(() => goBack),
              ),
            })([
              MaterialIcons({
                name: 'delete',
                color: theme.colors.lightText,
                size: 24,
              }),
            ]),
          ),
          O.toUndefined,
        ),
      }),
    ]),
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
          onChange: $f(replaceSApp(PlayerFormLens.at('name')), execute),
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
        O.fromPredicate(not(Str.isEmpty)),
        O.match(
          () => RIO.of(undefined),
          () =>
            $(
              goBack,
              RIO.chain(() =>
                $(
                  groupId,
                  O.match(
                    () => RIO.of(undefined),
                    groupId =>
                      $(
                        id,
                        O.matchW(
                          () => createPlayer({ groupId, player: form }),
                          id =>
                            execute(
                              editPlayer({
                                groupId,
                                player: { ...form, id },
                              }),
                            ),
                        ),
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
