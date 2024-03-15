import * as Context from 'effect/Context'
import { Repository } from '.'

export class RepositoryEnv extends Context.Tag('Repository')<
  RepositoryEnv,
  Repository
>() {}
