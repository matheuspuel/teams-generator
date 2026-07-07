import { Effect, Option, pipe } from 'effect'
import * as React from 'react'
import { SafeAreaProvider as RawSafeAreaProvider_ } from 'react-native-safe-area-context'
import { UIColor } from 'src/components/types'
import { useRuntime } from 'src/contexts/Runtime'
import { useThemeGetRawColor } from 'src/contexts/Theme'
import { SafeAreaService } from 'src/services/SafeArea'

export type SafeAreaProviderProps = {
  flex?: number
  bg?: UIColor
  children?: React.ReactNode
}

export const SafeAreaProvider = (props: SafeAreaProviderProps) => {
  const runtime = useRuntime()
  const getRawColor = useThemeGetRawColor()
  return (
    <RawSafeAreaProvider_
      children={props.children}
      initialMetrics={pipe(
        SafeAreaService.initialMetrics(),
        Effect.map(Option.getOrUndefined),
        runtime.runSync,
      )}
      style={{
        backgroundColor: props?.bg ? getRawColor(props.bg) : undefined,
      }}
    />
  )
}
