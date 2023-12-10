import { A, Data, F, Match, O, S, Stream, String, flow, pipe } from 'fp'
import { Group, Modality } from 'src/datatypes'
import {
  CustomModality,
  soccer,
  staticModalities,
} from 'src/datatypes/Modality'
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
import { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'

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
      State.with(getModality(group.modality)).pipe(F.flatten),
    ),
    StateRef.query,
    F.bind('fileUri', ({ group }) => makeFileUri(group)),
    F.tap(({ group, modality, fileUri }) =>
      pipe(
        S.encode(schema)({ ...group, modality }),
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
  data: Omit<Group, 'modality'> & {
    modality: { _tag: 'StaticModality'; id: NonEmptyString } | CustomModality
  },
) =>
  data.modality._tag === 'StaticModality'
    ? pipe(
        A.findFirst(staticModalities, m => m.id === data.modality.id),
        O.getOrElse(() => soccer),
        modality =>
          pipe(
            F.all({
              modality: F.succeed({ _tag: modality._tag, id: modality.id }),
              name: F.succeed(data.name),
              players: F.forEach(data.players, p =>
                pipe(
                  F.all({
                    id: IdGenerator.generate(),
                    positionAbbreviation: A.findFirst(
                      modality.positions,
                      pos => pos.abbreviation === p.positionAbbreviation,
                    ).pipe(
                      O.getOrElse(() => modality.positions[0]),
                      _ => _.abbreviation,
                      F.succeed,
                    ),
                  }),
                  F.map(({ id, positionAbbreviation }) => ({
                    ...p,
                    id,
                    positionAbbreviation,
                  })),
                ),
              ),
            }),
            F.flatMap(addImportedGroup),
          ),
      )
    : pipe(
        F.succeed({ modality: data.modality }),
        F.bind('existingModality', ({ modality }) =>
          State.with(s =>
            A.findFirst(
              s.customModalities,
              m =>
                m.name === modality.name &&
                modality.positions.every(a =>
                  m.positions.some(b => a.abbreviation === b.abbreviation),
                ),
            ),
          ),
        ),
        F.bind('nextModalityId', ({ existingModality }) =>
          existingModality.pipe(
            O.map(_ => _.id),
            F.orElse(() => IdGenerator.generate()),
          ),
        ),
        F.tap(({ existingModality, modality, nextModalityId }) =>
          O.match(existingModality, {
            onNone: () =>
              State.on(root.at('customModalities')).update(
                A.append({
                  _tag: 'CustomModality' as const,
                  id: nextModalityId,
                  name: modality.name,
                  positions: modality.positions,
                }),
              ),
            onSome: () => F.unit,
          }),
        ),
        F.tap(({ nextModalityId }) =>
          pipe(
            F.all({
              modality: F.succeed({
                _tag: 'CustomModality' as const,
                id: nextModalityId,
              }),
              name: F.succeed(data.name),
              players: F.forEach(data.players, p =>
                F.map(IdGenerator.generate(), id => ({ ...p, id })),
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

const dataSchema = Group.Group.pipe(
  S.omit('modality'),
  S.extend(
    S.struct({
      modality: S.union(
        S.struct({ _tag: S.literal('StaticModality'), id: NonEmptyString }),
        Modality.CustomModality,
      ),
    }),
  ),
)

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
