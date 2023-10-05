import { Runtime } from 'fp'
import React from 'react'
import { Text as RNText_ } from 'react-native'
import { Children, JSXElementsChildren, UIElement } from 'src/components/types'
import { useRuntime } from 'src/contexts/Runtime'
import { AppRuntime } from 'src/runtime'
import { Color } from 'src/utils/datatypes'
import { named2 } from '../hyperscript'
import { TextProps } from './Txt'

export type TxtContextArgs = {
  x?: TextProps
  children?: JSXElementsChildren
  runtime: AppRuntime
}

const getRawProps = ({
  x: props,
  children,
  runtime,
}: TxtContextArgs): React.ComponentProps<typeof RNText_> => ({
  children: children,
  numberOfLines: props?.numberOfLines,
  style: {
    padding: props?.p,
    paddingHorizontal: props?.px,
    paddingVertical: props?.py,
    paddingLeft: props?.pl,
    paddingRight: props?.pr,
    paddingTop: props?.pt,
    paddingBottom: props?.pb,
    margin: props?.m,
    marginHorizontal: props?.mx,
    marginVertical: props?.my,
    marginLeft: props?.ml,
    marginRight: props?.mr,
    marginTop: props?.mt,
    marginBottom: props?.mb,
    width: props?.w,
    height: props?.h,
    flex: props?.flex,
    color: props?.color
      ? Color.toHex(Runtime.runSync(runtime)(props.color))
      : undefined,
    textAlign: props?.align ?? 'center',
    fontSize: props?.size,
    fontWeight: props?.weight ? `${props.weight}` : undefined,
    lineHeight: props?.lineHeight,
  },
})

const TxtContext_ = (args: TxtContextArgs) =>
  React.createElement(RNText_, getRawProps(args))

export const TxtContext = named2('TxtContext')((props: TextProps = {}) =>
  // eslint-disable-next-line react/display-name
  (children: Children): UIElement => {
    const runtime = useRuntime()
    return React.createElement(TxtContext_, { x: props, runtime }, ...children)
  },
)
