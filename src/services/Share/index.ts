import { Task } from 'fp'

export type ShareService = {
  share: (args: { title: string; message: string }) => Task<void>
}

export type ShareServiceEnv = { share: ShareService }

export const ShareService = {
  share:
    (args: Parameters<ShareService['share']>[0]) => (env: ShareServiceEnv) =>
      env.share.share(args),
}
