import {
  A,
  Data,
  F,
  HashMap,
  Match,
  O,
  S,
  Stream,
  String,
  flow,
  pipe,
} from 'fp'
import { Group, Modality } from 'src/datatypes'
import { root } from 'src/model/optic'
import { Alert } from 'src/services/Alert'
import { DocumentPicker } from 'src/services/DocumentPicker'
import { FileSystem } from 'src/services/FileSystem'
import { IdGenerator } from 'src/services/IdGenerator'
import { Linking } from 'src/services/Linking'
import { ShareService } from 'src/services/Share'
import { State, StateRef } from 'src/services/StateRef'
import { addImportedGroup, getGroupById, getModality } from 'src/slices/groups'
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
    F.bindTo('group'),
    F.bind('modality', ({ group }) =>
      State.with(getModality(group.modalityId)).pipe(F.flatten),
    ),
    StateRef.query,
    F.bind('fileUri', ({ group }) => makeFileUri(group)),
    F.tap(({ group, modality, fileUri }) =>
      pipe(
        S.encode(schema)({ group, modality }),
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

export const _importGroup = (
  data: Readonly<{
    group: Group
    modality: Modality
  }>,
) =>
  pipe(
    F.succeed(data),
    F.bind('existingModality', ({ modality }) =>
      State.with(s =>
        A.findFirst(
          s.modalities,
          m =>
            m.name === modality.name &&
            modality.positions.every(a =>
              m.positions.some(b => a.abbreviation === b.abbreviation),
            ),
        ),
      ),
    ),
    F.bind('positions', ({ modality, existingModality }) =>
      pipe(
        modality.positions,
        A.map(p => [p.id, p] as const),
        F.forEach(([oldId, p]) =>
          existingModality.pipe(
            O.flatMap(m =>
              A.findFirst(
                m.positions,
                p2 => p2.abbreviation === p.abbreviation,
              ),
            ),
            O.map(_ => _.id),
            F.orElse(() => IdGenerator.generate()),
            F.map(id => [oldId, { ...p, id }] as const),
          ),
        ),
        F.map(HashMap.fromIterable),
      ),
    ),
    F.bind('nextModalityId', ({ existingModality }) =>
      existingModality.pipe(
        O.map(_ => _.id),
        F.orElse(() => IdGenerator.generate()),
      ),
    ),
    F.tap(({ existingModality, positions, modality, nextModalityId }) =>
      O.match(existingModality, {
        onNone: () =>
          pipe(
            F.all({
              id: F.succeed(nextModalityId),
              name: F.succeed(modality.name),
              positions: F.all(
                A.mapNonEmpty(modality.positions, p =>
                  HashMap.get(positions, p.id).pipe(
                    F.orElse(() =>
                      IdGenerator.generate().pipe(F.map(id => ({ ...p, id }))),
                    ),
                  ),
                ),
              ),
            }),
            F.tap(m => State.on(root.at('modalities')).update(A.append(m))),
          ),
        onSome: () => F.unit,
      }),
    ),
    F.tap(({ group, positions, nextModalityId }) =>
      pipe(
        F.all({
          id: IdGenerator.generate(),
          modalityId: F.succeed(nextModalityId),
          name: F.succeed(group.name),
          players: F.forEach(group.players, p =>
            pipe(
              F.all({
                id: IdGenerator.generate(),
                positionId: HashMap.get(positions, p.positionId).pipe(
                  O.map(_ => _.id),
                  F.orElse(() => IdGenerator.generate()),
                ),
              }),
              F.map(({ id, positionId }) => ({
                ...p,
                id,
                positionId,
              })),
            ),
          ),
        }),
        F.flatMap(addImportedGroup),
      ),
    ),
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
        S.parse(schema)(data),
        F.catchTags({
          ParseError: e =>
            pipe(
              S.parse(S.compose(S.ParseJson, anyVersionSchema))(data),
              F.flatMap(d =>
                F.fail(
                  d.version > currentVersion
                    ? NewerVersionError()
                    : d.version < lastSupportedVersion
                    ? OldVersionError()
                    : e,
                ),
              ),
            ),
        }),
      ),
    ),
    F.flatMap(data => pipe(_importGroup(data), StateRef.execute)),
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
            OldVersionError: () =>
              'O arquivo foi criado com uma versão antiga do aplicativo. Atualize o aplicativo antes de exportar e tente novamente.',
            FileSystemError: () => 'Não foi possível acessar o arquivo.',
            ParseError: () => 'O arquivo não é válido ou está corrompido',
          }),
        ),
      }),
    ),
  )

const dataSchema = S.struct({
  group: Group.Group,
  modality: Modality.Modality,
})

const lastSupportedVersion = 2 as const
const currentVersion = 2 as const

const schema = S.transform(
  S.compose(
    S.ParseJson,
    S.struct({
      application: S.literal('sorteio-times'),
      type: S.literal('group'),
      version: S.literal(currentVersion),
      data: dataSchema,
    }),
  ),
  dataSchema.pipe(S.to),
  v => v.data,
  v => ({
    application: 'sorteio-times' as const,
    type: 'group' as const,
    version: currentVersion,
    data: v,
  }),
)

const anyVersionSchema = S.struct({
  application: S.literal('sorteio-times'),
  type: S.literal('group'),
  version: S.JsonNumber,
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
  String.replace(/ /g, '-'),
  String.replace(/[^a-z0-9-]/g, ''),
)

export interface NewerVersionError extends Data.Case {
  _tag: 'NewerVersionError'
}
export const NewerVersionError =
  Data.tagged<NewerVersionError>('NewerVersionError')

export interface OldVersionError extends Data.Case {
  _tag: 'OldVersionError'
}
export const OldVersionError = Data.tagged<OldVersionError>('OldVersionError')
