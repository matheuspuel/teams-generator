import React from 'react'
import { Provider } from 'react-redux'
import { AppStoreEnv, store } from 'src/redux/store'

export type AppEnv = AppStoreEnv

export const useEnv = (): AppEnv => ({ store }) // TODO get from context

export const EnvProvider =
  // eslint-disable-next-line react/display-name
  (props: { env: AppEnv }) => (child: React.ReactElement) =>
    // eslint-disable-next-line react/no-children-prop
    React.createElement(Provider, {
      children: child,
      store: props.env.store._reduxStore, // TODO provide env
    })
