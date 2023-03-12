import { ReaderIO } from 'fp-ts/lib/ReaderIO'
import { HeaderBackButton as HeaderBackButton_ } from 'src/components/safe/react-navigation/HeaderBackButton'
import { Color, toHex } from 'src/utils/Color'

export const HeaderBackButton =
  <R>(props: { onPress: ReaderIO<R, void>; tintColor?: Color }) =>
  (env: R) =>
    HeaderBackButton_({
      ...props,
      tintColor: props.tintColor ? toHex(props.tintColor) : undefined,
    })(env)
