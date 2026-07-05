import * as path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    fakeTimers: { toFake: undefined },
    pool: 'forks',
    isolate: false,
  },
  resolve: {
    alias: {
      fp: path.join(__dirname, 'src/utils/fp'),
      'react-native': path.join(__dirname, 'src/mocks/libs/react-native.ts'),
      'expo-localization': path.join(
        __dirname,
        'src/mocks/libs/expo-localization.ts',
      ),
      'expo-document-picker': path.join(
        __dirname,
        'src/mocks/libs/expo-document-picker.ts',
      ),
    },
  },
})
