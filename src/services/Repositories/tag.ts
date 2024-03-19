import { Context } from 'effect'
import { Repository } from '.'

export class RepositoryEnv extends Context.Tag('Repository')<
  RepositoryEnv,
  Repository
>() {}
