import { Schema } from '@effect/schema'
import {
  Array,
  Data,
  Effect,
  Match,
  Option,
  Stream,
  String,
  flow,
  pipe,
} from 'effect'
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
    Effect.flatMap(
      Option.match({
        onNone: () => Effect.succeed(Option.none()),
        onSome: id => pipe(State.get, Effect.map(getGroupById(id))),
      }),
    ),
    Effect.flatten,
    Effect.bindTo('group'),
    Effect.bind('modality', ({ group }) =>
      State.flatWith(getModality(group.modality)),
    ),
    StateRef.query,
    Effect.bind('fileUri', ({ group }) => makeFileUri(group)),
    Effect.tap(({ group, modality, fileUri }) =>
      pipe(
        Schema.encode(schema)({ ...group, modality }),
        Effect.tap(s => FileSystem.write({ uri: fileUri, data: s })),
      ),
    ),
    Effect.flatMap(({ fileUri }) =>
      ShareService.shareFile({
        title: 'Exportar Grupo',
        uri: fileUri,
        mimeType: 'application/json',
      }),
    ),
    Effect.tapError(e =>
      Effect.logError(e._tag === 'FileSystemError' ? e.error.message : e),
    ),
  )

export const importGroupFromDocumentPicker = () =>
  pipe(
    DocumentPicker.getDocument({ type: ['application/json'] }),
    Effect.flatMap(f => importGroupFromFile({ url: f.uri })),
  )

export const setupReceiveURLHandler = () =>
  pipe(
    Linking.getInitialURL(),
    Effect.flatten,
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
        Array.findFirst(staticModalities, m => m.id === data.modality.id),
        Option.getOrElse(() => soccer),
        modality =>
          pipe(
            Effect.all({
              modality: Effect.succeed({
                _tag: modality._tag,
                id: modality.id,
              }),
              name: Effect.succeed(data.name),
              players: Effect.forEach(data.players, p =>
                pipe(
                  Effect.all({
                    id: IdGenerator.generate(),
                    positionAbbreviation: Array.findFirst(
                      modality.positions,
                      pos => pos.abbreviation === p.positionAbbreviation,
                    ).pipe(
                      Option.getOrElse(() => modality.positions[0]),
                      _ => _.abbreviation,
                      Effect.succeed,
                    ),
                  }),
                  Effect.map(({ id, positionAbbreviation }) => ({
                    ...p,
                    id,
                    positionAbbreviation,
                  })),
                ),
              ),
            }),
            Effect.flatMap(addImportedGroup),
          ),
      )
    : pipe(
        Effect.succeed({ modality: data.modality }),
        Effect.bind('existingModality', ({ modality }) =>
          State.with(s =>
            Array.findFirst(
              s.customModalities,
              m =>
                m.name === modality.name &&
                modality.positions.every(a =>
                  m.positions.some(b => a.abbreviation === b.abbreviation),
                ),
            ),
          ),
        ),
        Effect.bind('nextModalityId', ({ existingModality }) =>
          existingModality.pipe(
            Option.map(_ => _.id),
            Effect.orElse(() => IdGenerator.generate()),
          ),
        ),
        Effect.tap(({ existingModality, modality, nextModalityId }) =>
          Option.match(existingModality, {
            onNone: () =>
              State.on(root.at('customModalities')).update(
                Array.append({
                  _tag: 'CustomModality' as const,
                  id: nextModalityId,
                  name: modality.name,
                  positions: modality.positions,
                }),
              ),
            onSome: () => Effect.void,
          }),
        ),
        Effect.tap(({ nextModalityId }) =>
          pipe(
            Effect.all({
              modality: Effect.succeed({
                _tag: 'CustomModality' as const,
                id: nextModalityId,
              }),
              name: Effect.succeed(data.name),
              players: Effect.forEach(data.players, p =>
                Effect.map(IdGenerator.generate(), id => ({ ...p, id })),
              ),
            }),
            Effect.flatMap(addImportedGroup),
          ),
        ),
      )

const importGroupFromFile = (args: { url: string }) =>
  pipe(
    temporaryImportUri,
    Effect.tap(() => Effect.logDebug(args.url)),
    Effect.tap(tempUri => FileSystem.copy({ from: args.url, to: tempUri })),
    Effect.tapError(e => Effect.logError(e.error)),
    Effect.flatMap(tempUri => FileSystem.read({ uri: tempUri })),
    Effect.flatMap(data =>
      pipe(
        Schema.decodeUnknown(schema)(data),
        Effect.catchTags({
          ParseError: e =>
            pipe(
              Schema.decodeUnknown(Schema.parseJson(anyVersionSchema))(data),
              Effect.flatMap(d =>
                Effect.fail(
                  d.version > currentVersion
                    ? new NewerVersionError()
                    : d.version < lastSupportedVersion
                      ? new OldVersionError()
                      : e,
                ),
              ),
            ),
        }),
      ),
    ),
    Effect.flatMap(data => pipe(_importGroup(data), StateRef.execute)),
    Effect.tap(() =>
      Alert.alert({
        type: 'success',
        title: 'Sucesso',
        message: 'Grupo importado',
      }),
    ),
    Effect.tapError(e =>
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
  Schema.omit('modality'),
  Schema.extend(
    Schema.Struct({
      modality: Schema.Union(
        Schema.Struct({
          _tag: Schema.Literal('StaticModality'),
          id: NonEmptyString,
        }),
        Modality.CustomModality,
      ),
    }),
  ),
)

const lastSupportedVersion = 2
const currentVersion = 2

const schema = Schema.transform(
  Schema.parseJson(
    Schema.Struct({
      application: Schema.Literal('sorteio-times'),
      type: Schema.Literal('group'),
      version: Schema.Literal(currentVersion),
      data: dataSchema,
    }),
  ),
  dataSchema.pipe(Schema.typeSchema),
  {
    decode: v => v.data,
    encode: v =>
      ({
        application: 'sorteio-times' as const,
        type: 'group' as const,
        version: currentVersion,
        data: v,
      }) as const,
  },
)

const anyVersionSchema = Schema.Struct({
  application: Schema.Literal('sorteio-times'),
  type: Schema.Literal('group'),
  version: Schema.JsonNumber,
})

const temporaryImportUri = Effect.map(
  FileSystem.cacheDirectory(),
  cacheDir => cacheDir + '/import2.json',
)

const makeFileUri = (group: Group) =>
  Effect.map(
    FileSystem.cacheDirectory(),
    cacheDir =>
      cacheDir + '/export/' + toUri(group.name) + '.sorteio-times.json',
  )

const toUri = flow(
  normalize,
  String.replace(/ /g, '-'),
  String.replace(/[^a-z0-9-]/g, ''),
)

export class NewerVersionError extends Data.TaggedError('NewerVersionError') {}

export class OldVersionError extends Data.TaggedError('OldVersionError') {}
