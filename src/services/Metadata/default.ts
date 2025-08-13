import { Effect, Layer, Option, Ref, flow, identity, pipe } from 'effect'
import * as Application from 'expo-application'
import * as Device from 'expo-device'
import packageJSON from 'src/../package.json'
import { preferences } from 'src/i18n'
import { IdGenerator } from 'src/services/IdGenerator'
import { Metadata, MetadataService } from '.'
import { AsyncStorageDefault } from '../AsyncStorage/default'
import { Repository } from '../Repositories'
import { RepositoryDefault } from '../Repositories/default'

export const MetadataServiceDefault = Effect.gen(function* () {
  const context = yield* Effect.context<Repository | IdGenerator>()
  return MetadataService.context({
    get: () =>
      pipe(
        Ref.get(metadataRef),
        Effect.flatMap(identity),
        Effect.orElse(() =>
          pipe(
            Effect.all({
              installation: pipe(
                Repository.metadata.Installation.get(),
                Effect.map(_ => ({ ..._, isFirstLaunch: false })),
                Effect.orElse(() =>
                  pipe(
                    IdGenerator.generate(),
                    Effect.map(id => ({ id })),
                    Effect.tap(
                      flow(
                        Repository.metadata.Installation.set,
                        Effect.catchAll(() => Effect.void),
                      ),
                    ),
                    Effect.map(_ => ({ ..._, isFirstLaunch: true })),
                  ),
                ),
              ),
              launch: Effect.map(IdGenerator.generate(), id => ({ id })),
              staticMeta: getStaticMetadata,
            }),
            Effect.map(
              (v): Metadata => ({
                ...v.staticMeta,
                installation: { id: v.installation.id },
                isFirstLaunch: v.installation.isFirstLaunch,
                launch: v.launch,
              }),
            ),
            Effect.tap(v => pipe(Option.some(v), x => Ref.set(metadataRef, x))),
          ),
        ),
        Effect.provide(context),
      ),
  })
}).pipe(
  Layer.effectContext,
  Layer.provide(
    Layer.provideMerge(
      Layer.mergeAll(RepositoryDefault, IdGenerator.Default),
      AsyncStorageDefault,
    ),
  ),
)

const metadataRef = Ref.make<Option.Option<Metadata>>(Option.none()).pipe(
  Effect.runSync,
)

const getStaticMetadata = Effect.sync(() => ({
  device: {
    modelName: Device.modelName,
    osVersion: Device.osVersion,
    platformApiLevel: Device.platformApiLevel,
  },
  application: {
    version: packageJSON.version,
    native: {
      version: Application.nativeApplicationVersion,
      buildVersion: Application.nativeBuildVersion,
    },
  },
  preferences: {
    languageCode: preferences.location.pipe(
      Option.map(_ => _.languageCode),
      Option.getOrNull,
    ),
    regionCode: preferences.location.pipe(
      Option.map(_ => _.regionCode),
      Option.getOrNull,
    ),
  },
}))
