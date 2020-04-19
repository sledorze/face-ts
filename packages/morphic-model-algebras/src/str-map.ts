import { Kind, URIS, Kind2, URIS2, HKT2 } from '@morphic-ts/common/lib/HKT'
import { ConfigsForType, ConfigsEnvs } from '@morphic-ts/common/lib/config'

/**
 *  @since 0.0.1
 */
export const StrMapURI = 'StrMapURI' as const
/**
 *  @since 0.0.1
 */
export type StrMapURI = typeof StrMapURI

declare module '@morphic-ts/algebras/lib/hkt' {
  export interface Algebra<F> {
    [StrMapURI]: ModelAlgebraStrMap<F>
  }
  export interface Algebra1<F extends URIS> {
    [StrMapURI]: ModelAlgebraStrMap1<F>
  }
  export interface Algebra2<F extends URIS2> {
    [StrMapURI]: ModelAlgebraStrMap2<F>
  }
}

/**
 *  @since 0.0.1
 */
export interface ModelAlgebraStrMap<F> {
  _F: F
  strMap: {
    <L, A, R>(codomain: HKT2<F, R, L, A>): HKT2<F, R, Record<string, L>, Record<string, A>>
  }
  strMapCfg: {
    <L, A, R>(codomain: HKT2<F, R, L, A>): <C extends ConfigsForType<Record<string, L>, Record<string, A>>>(
      config: C
    ) => HKT2<F, R & ConfigsEnvs<C>, Record<string, L>, Record<string, A>>
  }
}

/**
 *  @since 0.0.1
 */
export interface ModelAlgebraStrMap1<F extends URIS> {
  _F: F
  strMap: <A, R>(codomain: Kind<F, R, A>) => Kind<F, R, Record<string, A>>
  strMapCfg: <A, R>(
    codomain: Kind<F, R, A>
  ) => <C extends ConfigsForType<unknown, Record<string, A>>>(
    config: C
  ) => Kind<F, R & ConfigsEnvs<C>, Record<string, A>>
}

/**
 *  @since 0.0.1
 */
export interface ModelAlgebraStrMap2<F extends URIS2> {
  _F: F
  strMap: <L, A, R>(codomain: Kind2<F, R, L, A>) => Kind2<F, R, Record<string, L>, Record<string, A>>
  strMapCfg: <L, A, R>(
    codomain: Kind2<F, R, L, A>
  ) => <C extends ConfigsForType<Record<string, L>, Record<string, A>>>(
    config: C
  ) => Kind2<F, R & ConfigsEnvs<C>, Record<string, L>, Record<string, A>>
}
