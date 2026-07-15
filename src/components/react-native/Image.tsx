import { Effect, Match, pipe } from 'effect'
import * as React from 'react'
import { Image as RNImage_ } from 'react-native'
import type { Color } from 'src/utils/datatypes/Color'

export type ImageStyleProps = {
  w?: number
  h?: number
  aspectRatio?: number
  flex?: number
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'
}

export type ImageProps = ImageStyleProps & {
  src:
    | { _tag: 'require'; require: number }
    | { _tag: 'base64'; base64: string }
    | { _tag: 'uri'; uri: string }
  alt?: string
  tintColor?: Color
  Loading?: React.ReactNode
  Error?: React.ReactNode
}

type ImageStatus = 'loading' | 'success' | 'error'

export const Image = (props: ImageProps) => {
  const [status, setStatus] = React.useState<ImageStatus>('loading')
  React.useEffect(() => {
    if (props.src._tag === 'uri') {
      const uri = props.src.uri
      void pipe(
        Effect.tryPromise(() => RNImage_.prefetch(uri)),
        Effect.filterOrElse(
          b => b,
          () => Effect.fail(new Error('Error loading image')),
        ),
        Effect.matchEffect({
          onFailure: () => Effect.sync(() => setStatus('error')),
          onSuccess: () => Effect.sync(() => setStatus('success')),
        }),
        Effect.runPromise,
      )
    }
  }, [props.src._tag === 'uri' ? props.src.uri : undefined])
  return (
    (status === 'loading'
      ? props.Loading
      : status === 'error'
        ? props.Error
        : undefined) ?? (
      <RNImage_
        onLoad={() => setStatus('success')}
        onError={() => setStatus('error')}
        source={pipe(
          props.src,
          Match.valueTags({
            require: _ => _.require,
            uri: _ => ({ uri: _.uri }),
            base64: _ => ({ uri: 'data:image/png;base64,' + _.base64 }),
          }),
        )}
        alt={props.alt}
        style={{
          tintColor: props.tintColor?.toHex(),
          width: props.w,
          height: props.h,
          resizeMode: props.resizeMode,
          flex: props.flex,
          aspectRatio: props.aspectRatio,
        }}
      />
    )
  )
}
