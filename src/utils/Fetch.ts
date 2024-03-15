import { Unify } from 'effect'
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

export class EncodingError extends Data.TaggedError('EncodingError')<{
  error: unknown
}> {}

export class FetchingError extends Data.TaggedError('FetchingError')<{
  error: unknown
}> {}

export class BodyParsingError extends Data.TaggedError('BodyParsingError')<{
  error: unknown
}> {}

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
      catch: e => new FetchingError({ error: e }),
    }),
    F.map(r => ({
      status: r.status,
      headers: r.headers,
      getBodyString: () =>
        F.tryPromise({
          try: () => r.text(),
          catch: e => new BodyParsingError({ error: e }),
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
      : S.encode(S.parseJson())(args.body),
    _ => Unify.unify(_),
    F.mapError(e => new EncodingError({ error: e })),
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
        F.flatMap(S.decode(S.parseJson())),
        F.map(data => ({ ...r, data })),
      ),
    ),
  )
