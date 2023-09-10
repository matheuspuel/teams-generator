import { D, Data, F, Match, O, Str, Stream, flow, pipe } from 'fp'
import { Group } from 'src/datatypes'
import { root } from 'src/model/optic'
import { Alert } from 'src/services/Alert'
import { DocumentPicker } from 'src/services/DocumentPicker'
import { FileSystem } from 'src/services/FileSystem'
import { Linking } from 'src/services/Linking'
import { ShareService } from 'src/services/Share'
import { State, StateRef } from 'src/services/StateRef'
import { addImportedGroup, getGroupById } from 'src/slices/groups'
import { normalize } from 'src/utils/String'

export const exportGroup = () =>
  pipe(
    State.on(root.at('ui').at('selectedGroupId')).get,
    F.flatMap(
      O.match({
        onNone: () => F.succeed(O.none()),
        onSome: id => pipe(State.get, F.map(getGroupById(id))),
      }),
    ),
    F.flatten,
    StateRef.query,
    F.bindTo('group'),
    F.bind('fileUri', ({ group }) => makeFileUri(group)),
    F.tap(({ group, fileUri }) =>
      pipe(
        group,
        D.encode(schema),
        F.tap(s => FileSystem.write({ uri: fileUri, data: s })),
      ),
    ),
    F.flatMap(({ fileUri }) =>
      ShareService.shareFile({
        title: 'Exportar Grupo',
        uri: fileUri,
        mimeType: 'application/json',
      }),
    ),
    F.tapError(e =>
      F.logError(e._tag === 'FileSystemError' ? e.error.message : e),
    ),
  )

export const importGroupFromDocumentPicker = () =>
  pipe(
    DocumentPicker.getDocument({ type: ['application/json'] }),
    F.flatMap(f => importGroupFromFile({ url: f.uri })),
  )

export const setupReceiveURLHandler = () =>
  pipe(
    Linking.getInitialURL(),
    F.flatten,
    Stream.catchAll(() => Stream.empty),
    Stream.concat(Linking.startLinkingStream()),
    Stream.map(url => ({ url })),
    Stream.tap(importGroupFromFile),
  )

const importGroupFromFile = (args: { url: string }) =>
  pipe(
    temporaryImportUri,
    F.tap(() => F.logDebug(args.url)),
    F.tap(tempUri => FileSystem.copy({ from: args.url, to: tempUri })),
    F.tapError(e => F.logError(e.error)),
    F.flatMap(tempUri => FileSystem.read({ uri: tempUri })),
    F.flatMap(data =>
      pipe(
        D.parse(schema)(data),
        F.catchTags({
          ParseError: e =>
            pipe(
              D.parse(anyVersionSchema)(data),
              F.flatMap(d =>
                F.fail(d.version > currentVersion ? NewerVersionError() : e),
              ),
            ),
        }),
      ),
    ),
    F.flatMap(g => StateRef.execute(addImportedGroup(g))),
    F.tap(() =>
      Alert.alert({
        type: 'success',
        title: 'Sucesso',
        message: 'Grupo importado',
      }),
    ),
    F.tapError(e =>
      Alert.alert({
        type: 'error',
        title: 'Falha ao importar grupo',
        message: pipe(
          e,
          Match.valueTags({
            NewerVersionError: () =>
              'O arquivo foi criado com uma versão mais recente do aplicativo. Atualize o aplicativo e tente novamente.',
            FileSystemError: () => 'Não foi possível acessar o arquivo.',
            ParseError: () => 'O arquivo não é válido ou está corrompido',
          }),
        ),
      }),
    ),
  )

const dataSchema = Group.Schema

const currentVersion = 1 as const

const schema = D.transform(
  D.compose(
    D.ParseJson,
    D.struct({
      application: D.literal('sorteio-times'),
      type: D.literal('group'),
      version: D.literal(currentVersion),
      data: dataSchema,
    }),
  ),
  dataSchema.pipe(D.to),
  v => v.data,
  v => ({
    application: 'sorteio-times' as const,
    type: 'group' as const,
    version: currentVersion,
    data: v,
  }),
)

const anyVersionSchema = D.struct({
  application: D.literal('sorteio-times'),
  type: D.literal('group'),
  version: D.literal(currentVersion),
})

const temporaryImportUri = F.map(
  FileSystem.cacheDirectory(),
  cacheDir => cacheDir + '/import2.json',
)

const makeFileUri = (group: Group) =>
  F.map(
    FileSystem.cacheDirectory(),
    cacheDir =>
      cacheDir + '/export/' + toUri(group.name) + '.sorteio-times.json',
  )

const toUri = flow(
  normalize,
  Str.replace(/ /g, '-'),
  Str.replace(/[^a-z0-9-]/g, ''),
)

export interface NewerVersionError extends Data.Case {
  _tag: 'NewerVersionError'
}
export const NewerVersionError =
  Data.tagged<NewerVersionError>('NewerVersionError')
