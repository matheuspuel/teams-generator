import Header_ from '@react-navigation/elements/src/Header/Header'
import { $, Reader, constant } from 'fp'
import { Color } from 'src/utils/datatypes'
import { Element } from '../types'

export type HeaderProps<R1, R2, R3> = {
  title: string
  headerStyle?: { backgroundColor?: Reader<R1, Color> }
  headerTitleStyle?: { color?: Reader<R1, Color> }
  headerLeft?: Reader<R2, Element>
  headerRight?: Reader<R3, Element>
}

export type HeaderArgs<R1, R2, R3> = {
  x: HeaderProps<R1, R2, R3>
  env: R1 & R2 & R3
}

const getRawProps = <R1, R2, R3>({
  x: props,
  env,
}: HeaderArgs<R1, R2, R3>): React.ComponentProps<typeof Header_> => ({
  title: props.title,
  headerStyle: props.headerStyle
    ? {
        backgroundColor: $(props.headerStyle.backgroundColor, c =>
          c ? Color.toHex(c(env)) : undefined,
        ),
      }
    : undefined,
  headerTitleStyle: props.headerTitleStyle
    ? {
        color: $(props.headerTitleStyle.color, c =>
          c ? Color.toHex(c(env)) : undefined,
        ),
      }
    : undefined,
  headerLeft: props.headerLeft ? constant(props.headerLeft(env)) : undefined,
  headerRight: props.headerRight ? constant(props.headerRight(env)) : undefined,
})

export const Header = <R1, R2, R3>(args: HeaderArgs<R1, R2, R3>) => (
  <Header_ {...getRawProps(args)} />
)
