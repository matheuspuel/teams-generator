import { Header as Header_ } from 'src/components/hyperscript/react-navigation'

export const Header =
  <R>(props: {
    title: string
    headerStyle?: { backgroundColor?: string }
    headerTitleStyle?: { color?: string }
    headerLeft?: (env: R) => React.ReactElement
    headerRight?: (env: R) => React.ReactElement
  }) =>
  (env: R) =>
    Header_({
      ...props,
      headerLeft: props.headerLeft ? () => props.headerLeft?.(env) : undefined,
      headerRight: props.headerRight
        ? () => props.headerRight?.(env)
        : undefined,
    })(env)
