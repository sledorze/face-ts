import type { Recycle } from './recycle'

/**
 *  @since 0.0.1
 */
export const RecycleURI = 'RecycleURI' as const
/**
 *  @since 0.0.1
 */
export type RecycleURI = typeof RecycleURI

declare module '@morphic-ts/common/lib/config' {
  export interface ConfigType<E, A> {
    [RecycleURI]: Recycle<A>
  }
}

/**
 *  @since 0.0.1
 */
export class RecycleType<A> {
  _A!: A
  _URI!: RecycleURI
  constructor(public recycle: Recycle<A>) {}
}

declare module '@morphic-ts/common/lib/HKT' {
  interface URItoKind<R, A> {
    [RecycleURI]: (env: R) => RecycleType<A>
  }
}
