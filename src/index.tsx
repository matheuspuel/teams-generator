import './utils/ignoreLogs'

import { StatusBar } from 'expo-status-bar'
import { Provider } from 'react-redux'
import { Splash } from 'src/views/Splash'
import store from './redux/store'
import Router from './routes'

export const AppIndex = () => (
  <Provider store={store}>
    <StatusBar style="dark" />
    <Splash>
      <Router />
    </Splash>
  </Provider>
)
