import { Context, Effect } from 'effect'

export type ShareService = {
  shareMessage: (args: {
    title: string
    message: string
  }) => Effect.Effect<void>
  shareFile: (args: {
    title: string
    uri: string
    mimeType?: string
  }) => Effect.Effect<void>
}

export class ShareServiceEnv extends Context.Tag('ShareService')<
  ShareServiceEnv,
  ShareService
>() {}

export const ShareService = Effect.serviceFunctions(ShareServiceEnv)
