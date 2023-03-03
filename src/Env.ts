import React from 'react'
import { Provider } from 'react-redux'
import { AppStoreEnv, store } from 'src/redux/store'

export type AppEnv = AppStoreEnv

export const useEnv = (): AppEnv => ({ store }) // TODO get from context

export const EnvProvider = (props: {
  children: React.ReactNode
  env: AppEnv
}) =>
  // eslint-disable-next-line react/no-children-prop
  React.createElement(Provider, {
    children: props.children,
    store: props.env.store._reduxStore, // TODO provide env
  })
