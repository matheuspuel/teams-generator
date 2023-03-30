import React from 'react'
import { View, ViewArgs } from '../react-native/View'

export const Row: typeof View = <R extends unknown>(args: ViewArgs<R>) => (
  <View {...args} x={{ direction: 'row', ...args.x }} />
)