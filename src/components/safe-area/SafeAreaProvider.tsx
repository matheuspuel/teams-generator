import { Effect, Option, pipe } from 'effect'
import * as React from 'react'
import { SafeAreaProvider as RawSafeAreaProvider_ } from 'react-native-safe-area-context'
import { useRuntime } from 'src/contexts/Runtime'
import { SafeAreaService } from 'src/services/SafeArea'
import type { Color } from 'src/utils/datatypes/Color'

export type SafeAreaProviderProps = {
  flex?: number
  bg?: Color
  children?: React.ReactNode
}

export const SafeAreaProvider = (props: SafeAreaProviderProps) => {
  const runtime = useRuntime()
  return (
    <RawSafeAreaProvider_
      children={props.children}
      initialMetrics={pipe(
        SafeAreaService.initialMetrics(),
        Effect.map(Option.getOrUndefined),
        runtime.runSync,
      )}
      style={{
        backgroundColor: props?.bg?.toHex(),
      }}
    />
  )
}
