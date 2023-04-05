import { Event } from 'src/actions'
import { View, ViewArgs } from '../react-native/View'

export const Row: typeof View = <
  R,
  E1 extends Event<string, unknown> = Event<never, never>,
>(
  args: ViewArgs<R, E1>,
) => <View {...args} x={{ direction: 'row', ...args.x }} />
