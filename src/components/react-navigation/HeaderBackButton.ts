import { ReaderIO } from 'fp-ts/lib/ReaderIO'
import { HeaderBackButton as HeaderBackButton_ } from 'src/components/hyperscript/react-navigation'

export const HeaderBackButton =
  <R>(props: { onPress: ReaderIO<R, void>; tintColor?: string }) =>
  (env: R) =>
    HeaderBackButton_({
      ...props,
      onPress: props.onPress(env),
    })(env)
