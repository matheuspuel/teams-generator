import {
  Screen as Screen_,
  ScreenContainer as ScreenContainer_,
  ScreenContainerProps,
  ScreenStack as ScreenStack_,
  ScreenStackProps,
} from 'react-native-screens'
import { makeComponent } from './helpers'

export const ScreenStack = makeComponent(
  ScreenStack_ as React.FunctionComponent<ScreenStackProps>,
)

export const ScreenContainer = makeComponent(
  ScreenContainer_ as React.FunctionComponent<ScreenContainerProps>,
)

export const Screen = makeComponent(Screen_)
