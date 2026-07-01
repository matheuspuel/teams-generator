import { Runtime } from 'effect'
import * as React from 'react'
import { useRuntime } from 'src/contexts/Runtime'
import { useState } from 'src/hooks/useState'

export const PreRender = ({
  initial,
  children,
}: {
  initial: React.ReactNode
  children: React.ReactNode
}) => {
  const runtime = useRuntime()
  const isPrerender = useState(() => true)
  React.useEffect(() => {
    setTimeout(() => isPrerender.set(false).pipe(Runtime.runSync(runtime)), 25)
  }, [])
  return isPrerender.value ? initial : children
}
