/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

// Learn more https://docs.expo.io/guides/customizing-metro
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { getDefaultConfig } = require('expo/metro-config')

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, functional/no-expression-statement, functional/immutable-data
module.exports = getDefaultConfig(__dirname)
