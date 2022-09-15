/* eslint-disable @typescript-eslint/no-explicit-any */

let cache: any = {}

export function setCache(value: any) {
  cache = value
  // console.log('setcache', value)
}

export function getCache() {
  // console.log('getcache', cache)
  return cache
}
