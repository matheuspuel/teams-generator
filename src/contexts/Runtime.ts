import * as React from 'react'
import { runtime } from 'src/runtime'

export const RuntimeContext = React.createContext(runtime)

export const useRuntime = () => React.useContext(RuntimeContext)
