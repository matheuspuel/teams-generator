import { Text as Text_ } from 'react-native'
import { Color } from 'src/utils/datatypes'
import { JSXElementsChildren } from '../types'
import { TextProps } from './Txt'

export type TxtContextArgs<R> = {
  x?: TextProps<R>
  children?: JSXElementsChildren
  env: R
}

const getRawProps = <R,>({
  x: props,
  children,
  env,
}: TxtContextArgs<R>): React.ComponentProps<typeof Text_> => ({
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
    color: props?.color ? Color.toHex(props.color(env)) : undefined,
    textAlign: props?.align,
    fontSize: props?.size,
    fontWeight: props?.weight ? `${props.weight}` : undefined,
    lineHeight: props?.lineHeight,
  },
})

export const TxtContext = <R,>(args: TxtContextArgs<R>) => (
  <Text_ {...getRawProps(args)} />
)
