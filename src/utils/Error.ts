export const fatal = (reason: string): never => {
  // eslint-disable-next-line functional/no-throw-statements
  throw new Error(reason)
}

export const enforceErrorInstance = (e: unknown) =>
  e instanceof Error
    ? e
    : typeof e === 'string'
      ? new Error(e)
      : new Error('Unknown type of error')
