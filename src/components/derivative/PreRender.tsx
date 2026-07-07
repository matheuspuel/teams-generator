import * as React from 'react'
import { useState } from 'src/hooks/useState'

export const PreRender = ({
  initial,
  children,
}: {
  initial: React.ReactNode
  children: React.ReactNode
}) => {
  const isPrerender = useState(() => true)
  React.useEffect(() => {
    setTimeout(() => isPrerender.set(false), 25)
  }, [])
  return isPrerender.value ? initial : children
}
