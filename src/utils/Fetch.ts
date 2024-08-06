import { Schema } from '@effect/schema'
import { Data, Effect, Unify, pipe } from 'effect'

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
  cause: unknown
}> {}

export class FetchingError extends Data.TaggedError('FetchingError')<{
  cause: unknown
}> {}

export class BodyParsingError extends Data.TaggedError('BodyParsingError')<{
  cause: unknown
}> {}

export const bare = (args: {
  method: HttpMethod
  url: string
  bodyString?: string
  headers: Record<string, string>
}) =>
  pipe(
    Effect.tryPromise({
      try: () =>
        fetch(args.url, {
          method: args.method,
          body: args.bodyString,
          headers: args.headers,
        }),
      catch: e => new FetchingError({ cause: e }),
    }),
    Effect.map(r => ({
      status: r.status,
      headers: r.headers,
      getBodyString: () =>
        Effect.tryPromise({
          try: () => r.text(),
          catch: e => new BodyParsingError({ cause: e }),
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
      ? Effect.succeed(undefined)
      : Schema.encode(Schema.parseJson())(args.body),
    _ => Unify.unify(_),
    Effect.mapError(e => new EncodingError({ cause: e })),
    Effect.flatMap(bodyString =>
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
    Effect.flatMap(({ getBodyString, ...r }) =>
      pipe(
        getBodyString(),
        Effect.flatMap(Schema.decode(Schema.parseJson())),
        Effect.map(data => ({ ...r, data })),
      ),
    ),
  )
