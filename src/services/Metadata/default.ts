import * as Application from 'expo-application'
import * as Device from 'expo-device'
import { F, Layer, O, Option, Ref, flow, identity, pipe } from 'fp'
import packageJSON from 'src/../package.json'
import { preferences } from 'src/i18n'
import { IdGenerator } from 'src/services/IdGenerator'
import { IdGeneratorLive } from 'src/services/IdGenerator/default'
import { Metadata, MetadataServiceEnv } from 'src/services/Metadata'
import { Repository } from 'src/services/Repositories'
import { AsyncStorageLive } from '../AsyncStorage/live'
import { RepositoryLive } from '../Repositories/live'

const metadataRef = Ref.make<Option<Metadata>>(O.none()).pipe(F.runSync)

const getStaticMetadata = F.sync(() => ({
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
      O.map(_ => _.languageCode),
      O.getOrNull,
    ),
    regionCode: preferences.location.pipe(
      O.map(_ => _.regionCode),
      O.getOrNull,
    ),
  },
}))

export const MetadataServiceLive = MetadataServiceEnv.context({
  get: () =>
    pipe(
      Ref.get(metadataRef),
      F.flatMap(identity),
      F.orElse(() =>
        pipe(
          F.all({
            installation: pipe(
              Repository.metadata.Installation.get(),
              F.map(_ => ({ ..._, isFirstLaunch: false })),
              F.orElse(() =>
                pipe(
                  IdGenerator.generate(),
                  F.map(id => ({ id })),
                  F.tap(
                    flow(
                      Repository.metadata.Installation.set,
                      F.catchAll(() => F.unit),
                    ),
                  ),
                  F.map(_ => ({ ..._, isFirstLaunch: true })),
                ),
              ),
            ),
            launch: F.map(IdGenerator.generate(), id => ({ id })),
            staticMeta: getStaticMetadata,
          }),
          F.map(
            (v): Metadata => ({
              ...v.staticMeta,
              installation: { id: v.installation.id },
              isFirstLaunch: v.installation.isFirstLaunch,
              launch: v.launch,
            }),
          ),
          F.tap(v => pipe(O.some(v), x => Ref.set(metadataRef, x))),
        ),
      ),
      F.provide(
        Layer.provideMerge(
          AsyncStorageLive,
          Layer.mergeAll(RepositoryLive, IdGeneratorLive),
        ),
      ),
    ),
}).pipe(Layer.succeedContext)
