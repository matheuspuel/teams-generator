import React from 'react'
import { useRuntime } from 'src/contexts/Runtime'
import { useState } from 'src/hooks/useState'
import { Runtime } from 'src/utils/fp'
import { named2 } from '../hyperscript'
import { UIElement } from '../types'

export const PreRender = named2('PreRender')(
  (prerenderComponent: UIElement) => (actualComponent: UIElement) => {
    const runtime = useRuntime()
    const prerender = useState(() => true)
    // eslint-disable-next-line functional/no-expression-statements
    React.useEffect(() => {
      // eslint-disable-next-line functional/no-expression-statements
      prerender.set(false).pipe(Runtime.runSync(runtime))
    }, [])
    return prerender.value ? prerenderComponent : actualComponent
  },
)
