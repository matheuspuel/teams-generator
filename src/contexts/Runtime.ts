import * as React from 'react'
import { named } from 'src/components/hyperscript'
import { Children } from 'src/components/types'
import { runtime } from 'src/runtime'

export const RuntimeContext = React.createContext(runtime)

export const useRuntime = () => React.useContext(RuntimeContext)

export const RuntimeContextProvider = named('RuntimeContextProvider')(
  (children: Children) =>
    React.createElement(RuntimeContext.Provider, undefined, ...children),
)
