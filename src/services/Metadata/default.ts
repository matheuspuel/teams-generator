import * as Application from 'expo-application'
import * as Device from 'expo-device'
import { $, $f, Eff, O, Option, identity } from 'fp'
import packageJSON from 'src/../package.json'
import { IdGenerator, IdGeneratorEnv } from 'src/services/IdGenerator'
import { defaultIdGenerator } from 'src/services/IdGenerator/default'
import { Metadata, MetadataService } from 'src/services/Metadata'
import { Repository, RepositoryEnvs } from 'src/services/Repositories'
import { defaultInstallationRepository } from 'src/services/Repositories/metadata/installation/default'
import { Ref } from 'src/utils/datatypes'

const metadataRef = Ref.create<Option<Metadata>>(O.none())

const getStaticMetadata = Eff.sync(() => ({
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

export const defaultMetadataService: MetadataService = {
  get: $(
    metadataRef.getState,
    Eff.flatMap(identity),
    Eff.orElse(() =>
      $(
        Eff.all({
          installation: $(
            Repository.metadata.installation.get,
            Eff.map(_ => ({ ..._, isFirstLaunch: false })),
            Eff.orElse(() =>
              $(
                IdGenerator.generate,
                Eff.map(id => ({ id })),
                Eff.tap(
                  $f(
                    Repository.metadata.installation.set,
                    Eff.catchAll(() => Eff.unit),
                  ),
                ),
                Eff.map(_ => ({ ..._, isFirstLaunch: true })),
              ),
            ),
          ),
          launch: Eff.map(IdGenerator.generate, id => ({ id })),
          staticMeta: getStaticMetadata,
        }),
        Eff.map(
          (v): Metadata => ({
            ...v.staticMeta,
            installation: { id: v.installation.id },
            isFirstLaunch: v.installation.isFirstLaunch,
            launch: v.launch,
          }),
        ),
        Eff.tap(v => $(O.some(v), metadataRef.setState)),
      ),
    ),
    Eff.provideService(RepositoryEnvs.metadata.installation, {
      Repositories: {
        metadata: { installation: defaultInstallationRepository },
      },
    }),
    Eff.provideService(IdGeneratorEnv, { idGenerator: defaultIdGenerator }),
  ),
}
