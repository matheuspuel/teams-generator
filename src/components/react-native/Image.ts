import { Effect, Runtime, pipe } from 'effect'
import * as React from 'react'
import { Image as RNImage_ } from 'react-native'
import { UIColor, UIElement } from 'src/components/types'
import { useRuntime } from 'src/contexts/Runtime'
import { useThemeGetRawColor } from 'src/contexts/Theme'
import * as Match from 'src/utils/fp/Match'
import { named } from '../hyperscript'

export type ImageStyleProps = {
  w?: number
  h?: number
  aspectRatio?: number
  flex?: number
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'
}

export type ImageProps = ImageStyleProps & {
  key?: string
  src:
    | { _tag: 'require'; require: number }
    | { _tag: 'base64'; base64: string }
    | { _tag: 'uri'; uri: string }
  alt?: string
  tintColor?: UIColor
  Loading?: UIElement
  Error?: UIElement
}

type ImageStatus = 'loading' | 'success' | 'error'

export const Image = named('Image')((props: ImageProps) => {
  const runtime = useRuntime()
  const getThemeRawColor = useThemeGetRawColor()
  const [status, setStatus] = React.useState<ImageStatus>('loading')
  React.useEffect(() => {
    void pipe(
      props.src,
      Match.valueTagsOrElse({
        uri: ({ uri }) =>
          pipe(
            Effect.tryPromise(() => RNImage_.prefetch(uri)),
            Effect.filterOrElse(
              b => b,
              () => Effect.fail(new Error('Error loading image')),
            ),
            Effect.matchEffect({
              onFailure: () => Effect.sync(() => setStatus('error')),
              onSuccess: () => Effect.sync(() => setStatus('success')),
            }),
          ),
        _: () => Effect.void,
      }),
      Runtime.runPromise(runtime),
    )
  }, [props.src._tag === 'uri' ? props.src.uri : undefined])
  return (
    (status === 'loading'
      ? props.Loading
      : status === 'error'
        ? props.Error
        : undefined) ??
    React.createElement(RNImage_, {
      onLoad: () => setStatus('success'),
      onError: () => setStatus('error'),
      source: pipe(
        props.src,
        Match.valueTags({
          require: _ => _.require,
          uri: _ => ({ uri: _.uri }),
          base64: _ => ({ uri: 'data:image/png;base64,' + _.base64 }),
        }),
      ),
      alt: props.alt,
      style: {
        tintColor: props.tintColor && getThemeRawColor(props.tintColor),
        width: props.w,
        height: props.h,
        resizeMode: props.resizeMode,
        flex: props.flex,
        aspectRatio: props.aspectRatio,
      },
    } satisfies React.ComponentProps<typeof RNImage_>)
  )
})
