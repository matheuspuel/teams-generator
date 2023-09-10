import { A, Runtime, apply, pipe } from 'fp'
import React from 'react'
import { Text as RNText_ } from 'react-native'
import { Children, JSXElementsChildren, UIElement } from 'src/components/types'
import { UIEnv } from 'src/services/UI'
import { Color } from 'src/utils/datatypes'
import { TextProps } from './Txt'

export type TxtContextArgs = {
  x?: TextProps
  children?: JSXElementsChildren
  env: UIEnv
}

const getRawProps = ({
  x: props,
  children,
  env,
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
      ? Color.toHex(Runtime.runSync(env.runtime)(props.color))
      : undefined,
    textAlign: props?.align ?? 'center',
    fontSize: props?.size,
    fontWeight: props?.weight ? `${props.weight}` : undefined,
    lineHeight: props?.lineHeight,
  },
})

const TxtContext_ = (args: TxtContextArgs) =>
  React.createElement(RNText_, getRawProps(args))

export const TxtContext =
  (props: TextProps = {}) =>
  (children: Children): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(
      TxtContext_,
      { x: props, env },
      ...pipe(children, A.map(apply(env))),
    )
