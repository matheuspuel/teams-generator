import 'fast-text-encoding'
import 'react-native-gesture-handler'

import { Runtime } from 'effect'
import { startApp } from 'src/app'
import { runtime } from './runtime'

void Runtime.runPromiseExit(runtime)(startApp)

import 'expo-router/entry'
