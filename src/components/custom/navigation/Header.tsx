import Header_ from '@react-navigation/elements/src/Header/Header'
import { Color } from 'src/utils/datatypes'
import { $, Reader, constant } from 'src/utils/fp'
import { Element } from '../types'

export type HeaderProps<R> = {
  title: string
  headerStyle?: { backgroundColor?: Reader<R, Color> }
  headerTitleStyle?: { color?: Reader<R, Color> }
  headerLeft?: Reader<R, Element>
  headerRight?: Reader<R, Element>
}

export type HeaderArgs<R> = {
  x: HeaderProps<R>
  env: R
}

const getRawProps = <R extends unknown>({
  x: props,
  env,
}: HeaderArgs<R>): React.ComponentProps<typeof Header_> => ({
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

export const Header = <R extends unknown>(args: HeaderArgs<R>) => (
  <Header_ {...getRawProps(args)} />
)