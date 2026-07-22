import { FileSystem, Path } from '@effect/platform'
import {
  Data,
  Effect,
  flow,
  Match,
  Option,
  pipe,
  Schema,
  Stream,
  String,
} from 'effect'
import { Group, Modality } from 'src/datatypes'
import { Alert } from 'src/services/Alert'
import { DocumentPicker } from 'src/services/DocumentPicker'
import { cacheDirectory } from 'src/services/FileSystem/expo'
import { Linking } from 'src/services/Linking'
import { ShareService } from 'src/services/Share'
import { normalize } from 'src/utils/String'
import { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'

export const exportGroup = ({
  group,
  modality,
}: {
  group: Group
  modality: Modality
}) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const fileUri = makeFileUri(group)
    const data = yield* Schema.encode(schema)({ ...group, modality })
    const directory = path.dirname(fileUri)
    yield* fs.makeDirectory(directory, { recursive: true })
    yield* fs.writeFileString(fileUri, data)
    yield* ShareService.shareFile({
      title: 'Exportar Grupo',
      uri: fileUri,
      mimeType: 'application/json',
    })
  }).pipe(
    Effect.tapError(e =>
      Effect.logError(
        e._tag === 'SystemError' || e._tag === 'BadArgument' ? e.cause : e,
      ),
    ),
  )

export const extractGroupFromDocumentPicker = () =>
  pipe(
    DocumentPicker.getDocument(),
    Effect.flatMap(f => extractGroupFromFile({ url: f.uri })),
  )

export const setupReceiveURLHandler = () =>
  pipe(
    Linking.getInitialURL(),
    Effect.flatMap(Option.fromNullable),
    Stream.catchAll(() => Stream.empty),
    Stream.concat(Linking.startLinkingStream()),
    Stream.map(url => ({ url })),
    Stream.flatMap(_ =>
      extractGroupFromFile(_).pipe(Stream.catchAllCause(() => Stream.empty)),
    ),
  )

const extractGroupFromFile = (args: { url: string }) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    yield* Effect.log(`Importing group from: ${args.url}`)
    yield* fs.remove(temporaryImportUri, { force: true })
    yield* fs
      .copyFile(args.url, temporaryImportUri)
      .pipe(Effect.tapErrorCause(_ => Effect.logError(_)))
    const rawData = yield* fs.readFileString(temporaryImportUri)
    const group = yield* pipe(
      Schema.decodeUnknown(schema)(rawData),
      Effect.catchTags({
        ParseError: e =>
          pipe(
            Schema.decodeUnknown(Schema.parseJson(anyVersionSchema))(rawData),
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
    )
    yield* Alert.alert({
      type: 'success',
      title: 'Sucesso',
      message: 'Grupo importado',
    })
    return group
  }).pipe(
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
            SystemError: () => 'Não foi possível acessar o arquivo.',
            BadArgument: () => 'Não foi possível acessar o arquivo.',
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

const temporaryImportUri = cacheDirectory + '/import2.json'

const makeFileUri = (group: Group) =>
  cacheDirectory + '/export/' + toUri(group.name) + '.sorteio-times.json'

const toUri = flow(
  normalize,
  String.replace(/ /g, '-'),
  String.replace(/[^a-z0-9-]/g, ''),
)

export class NewerVersionError extends Data.TaggedError('NewerVersionError') {}

export class OldVersionError extends Data.TaggedError('OldVersionError') {}
