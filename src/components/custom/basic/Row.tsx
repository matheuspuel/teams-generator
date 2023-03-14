import { View } from './View'

export const Row: typeof View = props => (
  <View {...{ direction: 'row', ...props }} />
)
