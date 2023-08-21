import { $, Data, E, F, Either, Json, identity } from 'fp'

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
export interface StringifyJsonError extends Data.Case {
  readonly _tag: 'StringifyJsonError'
  error: unknown
}
const StringifyJsonError = Data.tagged<StringifyJsonError>('StringifyJsonError')

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

export interface ParseJsonError extends Data.Case {
  readonly _tag: 'ParseJsonError'
  error: unknown
}
const ParseJsonError = Data.tagged<ParseJsonError>('ParseJsonError')

export const bare = (args: {
  method: HttpMethod
  url: string
  bodyString?: string
  headers: Record<string, string>
}) =>
  $(
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
  $(
    args.body === undefined ? E.right(undefined) : Json.stringify(args.body),
    identity<Either<unknown, undefined | string>>,
    E.mapLeft(e => StringifyJsonError({ error: e })),
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
      $(
        getBodyString(),
        F.flatMap(bodyString =>
          $(
            Json.parse(bodyString),
            identity<Either<unknown, Json.Json>>,
            E.mapLeft(e => ParseJsonError({ error: e })),
          ),
        ),
        F.map(data => ({ ...r, data })),
      ),
    ),
  )
