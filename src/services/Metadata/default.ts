import * as Application from 'expo-application'
import * as Device from 'expo-device'
import { $, $f, F, Layer, O, Option, Ref, identity } from 'fp'
import packageJSON from 'src/../package.json'
import { IdGenerator } from 'src/services/IdGenerator'
import { IdGeneratorLive } from 'src/services/IdGenerator/default'
import { Metadata, MetadataServiceEnv } from 'src/services/Metadata'
import { Repository } from 'src/services/Repositories'
import { InstallationRepositoryLive } from 'src/services/Repositories/metadata/installation/default'

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
}))

export const MetadataServiceLive = MetadataServiceEnv.context({
  get: () =>
    $(
      Ref.get(metadataRef),
      F.flatMap(identity),
      F.orElse(() =>
        $(
          F.all({
            installation: $(
              Repository.metadata.installation.get(),
              F.map(_ => ({ ..._, isFirstLaunch: false })),
              F.orElse(() =>
                $(
                  IdGenerator.generate(),
                  F.map(id => ({ id })),
                  F.tap(
                    $f(
                      Repository.metadata.installation.set,
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
          F.tap(v => $(O.some(v), x => Ref.set(metadataRef, x))),
        ),
      ),
      F.provideLayer(
        Layer.mergeAll(InstallationRepositoryLive, IdGeneratorLive),
      ),
    ),
}).pipe(Layer.succeedContext)
