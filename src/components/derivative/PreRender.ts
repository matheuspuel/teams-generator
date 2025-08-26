import { Runtime } from 'effect'
import * as React from 'react'
import { useRuntime } from 'src/contexts/Runtime'
import { useState } from 'src/hooks/useState'
import { named2 } from '../hyperscript'
import { UIElement } from '../types'

export const PreRender = named2('PreRender')(
  (prerenderComponent: UIElement) => (actualComponent: UIElement) => {
    const runtime = useRuntime()
    const prerender = useState(() => true)
    // eslint-disable-next-line functional/no-expression-statements
    React.useEffect(() => {
      // eslint-disable-next-line functional/no-expression-statements
      setTimeout(() => prerender.set(false).pipe(Runtime.runSync(runtime)), 25)
    }, [])
    return prerender.value ? prerenderComponent : actualComponent
  },
)
