import { Data, F, S, pipe } from 'fp'

export type HttpMethod =
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'GET'
  | 'HEAD'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface EncodingError extends Data.Case {
  readonly _tag: 'EncodingError'
  error: unknown
}
const EncodingError = Data.tagged<EncodingError>('EncodingError')

export interface FetchingError extends Data.Case {
  readonly _tag: 'FetchingError'
  error: unknown
}
const FetchingError = Data.tagged<FetchingError>('FetchingError')

export interface BodyParsingError extends Data.Case {
  readonly _tag: 'BodyParsingError'
  error: unknown
}
const BodyParsingError = Data.tagged<BodyParsingError>('BodyParsingError')

export const bare = (args: {
  method: HttpMethod
  url: string
  bodyString?: string
  headers: Record<string, string>
}) =>
  pipe(
    F.tryPromise({
      try: () =>
        fetch(args.url, {
          method: args.method,
          body: args.bodyString,
          headers: args.headers,
        }),
      catch: e => FetchingError({ error: e }),
    }),
    F.map(r => ({
      status: r.status,
      headers: r.headers,
      getBodyString: () =>
        F.tryPromise({
          try: () => r.text(),
          catch: e => BodyParsingError({ error: e }),
        }),
    })),
  )

export const json = (args: {
  method: HttpMethod
  url: string
  body?: unknown
  headers: Record<string, string>
}) =>
  pipe(
    args.body === undefined
      ? F.succeed(undefined)
      : S.encode(S.ParseJson)(args.body),
    F.unified,
    F.mapError(e => EncodingError({ error: e })),
    F.flatMap(bodyString =>
      bare({
        method: args.method,
        url: args.url,
        bodyString,
        headers: {
          ...args.headers,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }),
    ),
    F.flatMap(({ getBodyString, ...r }) =>
      pipe(
        getBodyString(),
        F.flatMap(S.decode(S.ParseJson)),
        F.map(data => ({ ...r, data })),
      ),
    ),
  )
