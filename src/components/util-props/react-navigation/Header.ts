import { Header as Header_ } from 'src/components/safe/react-navigation/Header'
import { Color, toHex } from 'src/utils/Color'
import { $ } from 'src/utils/fp'

export const Header =
  <R>(props: {
    title: string
    headerStyle?: { backgroundColor?: Color }
    headerTitleStyle?: { color?: Color }
    headerLeft?: (env: R) => React.ReactElement
    headerRight?: (env: R) => React.ReactElement
  }) =>
  (env: R) =>
    Header_({
      ...props,
      headerStyle: props.headerStyle
        ? {
            ...props.headerStyle,
            backgroundColor: $(props.headerStyle.backgroundColor, c =>
              c ? toHex(c) : undefined,
            ),
          }
        : undefined,
      headerTitleStyle: props.headerTitleStyle
        ? {
            ...props.headerTitleStyle,
            color: $(props.headerTitleStyle.color, c =>
              c ? toHex(c) : undefined,
            ),
          }
        : undefined,
    })(env)
