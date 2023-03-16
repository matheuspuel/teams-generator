import Header_ from '@react-navigation/elements/src/Header/Header'
import { Color, toHex } from 'src/utils/datatypes/Color'
import { $ } from 'src/utils/fp'

export const Header = (props: {
  title: string
  headerStyle?: { backgroundColor?: Color }
  headerTitleStyle?: { color?: Color }
  headerLeft?: React.ReactElement
  headerRight?: React.ReactElement
}) => (
  <Header_
    {...{
      title: props.title,
      headerLeft: () => props.headerLeft,
      headerRight: () => props.headerRight,
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
    }}
  />
)
