import type { Type } from 'io-ts'

/**
 *  @since 0.0.1
 */
export const IoTsURI = 'IoTsURI' as const
/**
 *  @since 0.0.1
 */
export type IoTsURI = typeof IoTsURI

declare module '@morphic-ts/common/lib/config' {
  export interface ConfigType<E, A> {
    [IoTsURI]: Type<A, E>
  }
}

/**
 *  @since 0.0.1
 */
export class IOTSType<O, A> {
  _A!: A
  _E!: O
  _URI!: IoTsURI
  constructor(public type: Type<A, O>) {}
}

declare module '@morphic-ts/common/lib/HKT' {
  interface URItoKind2<R, E, A> {
    [IoTsURI]: (env: R) => IOTSType<E, A>
  }
}
