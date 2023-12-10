import * as path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    fakeTimers: { toFake: undefined },
    pool: 'forks',
    poolOptions: { threads: { isolate: false }, forks: { isolate: false } },
  },
  resolve: {
    alias: {
      fp: path.join(__dirname, 'src/utils/fp'),
      'expo-localization': path.join(
        __dirname,
        'src/i18n/mock/expo-localization.ts',
      ),
    },
  },
})
