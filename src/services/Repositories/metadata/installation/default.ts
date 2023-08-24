import { D, Layer } from 'fp'
import { createStorage } from 'src/utils/storage'
import { RepositoryEnvs } from '../..'

export const InstallationRepositoryLive = RepositoryEnvs.metadata.installation
  .context(
    createStorage<{ id: string }, { id: string }>({
      key: 'telemetry/installation',
      schema: D.struct({ id: D.string }),
    }),
  )
  .pipe(Layer.succeedContext)
