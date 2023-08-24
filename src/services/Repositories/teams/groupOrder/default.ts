import { GroupOrder } from 'src/datatypes'
import { Layer } from 'src/utils/fp'
import { createStorage } from 'src/utils/storage'
import { RepositoryEnvs } from '../..'

export const GroupOrderRepositoryLive = RepositoryEnvs.teams.groupOrder
  .context(
    createStorage<GroupOrder, GroupOrder>({
      key: 'core/groupOrder',
      schema: GroupOrder.Schema,
    }),
  )
  .pipe(Layer.succeedContext)
