import { PreviewData } from 'src/redux/slices/preview'
import { createStorage } from 'src/utils/storage'
import { Group } from './datatypes/Group'
import { Parameters } from './datatypes/Parameters'
import { GroupsState } from './redux/slices/groups'
import { D } from './utils/fp-ts'

export const PreviewDataStorage = createStorage<PreviewData>({
  key: 'core/preview',
  decoder: D.struct({ serverUrl: D.string }),
})

export const GroupsStorage = createStorage<GroupsState>({
  key: 'core/groups',
  decoder: D.record(Group),
})

export const ParametersStorage = createStorage<Parameters>({
  key: 'core/parameters',
  decoder: Parameters,
})
