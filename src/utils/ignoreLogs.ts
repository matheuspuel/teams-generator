import { Platform } from 'react-native'

if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('react-native').LogBox.ignoreLogs([
    'Require cycle',
    'Setting a timer for a long period of time',
    'ReactNativeFiberHostComponent: Calling getNode() on the ref of an Animated component is no longer necessary.',
    'Remote debugger is in a background tab which may cause apps to perform slowly.',
  ])
}

const disableMessages = {
  log: ['was not found in'],
  warn: [
    'Require cycle',
    "Attempted import error: 'LogBox' is not exported from 'react-native-web/dist/index'.",
    "Attempted import error: 'ActionSheetIOS' is not exported from 'react-native-web/dist/index'.",
    '%s: Calling %s on the ref of an Animated component is no longer necessary.',
    'was not found in',
    'We can not support a function callback. See Github Issues for details https://github.com/adobe/react-spectrum/issues/2320',
    '`new NativeEventEmitter()` was called with a non-null argument without the required',
  ],
  error: [
    'Warning: React does not recognize the `%s` prop on a DOM element.',
    'was not found in',
  ],
}

const defaultConsole = { ...console }
console.log = (...data) =>
  disableMessages.log.some(m => data[0]?.includes?.(m)) ||
  defaultConsole.log(...data)
console.warn = (...data) =>
  disableMessages.warn.some(m => data[0]?.includes?.(m)) ||
  defaultConsole.warn(...data)
console.error = (...data) =>
  disableMessages.error.some(m => data[0]?.includes?.(m)) ||
  defaultConsole.error(...data)
