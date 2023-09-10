import { Layer, S } from 'fp'
import { createStorage } from 'src/utils/storage'
import { RepositoryEnvs } from '../..'

export const InstallationRepositoryLive = RepositoryEnvs.metadata.installation
  .context(
    createStorage<{ id: string }, { id: string }>({
      key: 'telemetry/installation',
      schema: S.struct({ id: S.string }),
    }),
  )
  .pipe(Layer.succeedContext)
