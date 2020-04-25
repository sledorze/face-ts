import { URIS, URIS2, Kind, Kind2 } from './HKT'
import { identity } from 'fp-ts/lib/function'
export { Kind, Kind2 }

/**
 *  @since 0.0.1
 */

export type URISIndexedAny = Record<URIS | URIS2, any>

export type AnyEnv = Partial<URISIndexedAny>

/**
 *  @since 0.0.1
 */
export interface GenConfig<A, R> {
  (a: A, r: R): A
}

/**
 *  @since 0.0.1
 */
export type NoEnv = unknown

/**
 *  @since 0.0.1
 */
export type MapToGenConfig<R extends AnyEnv, T extends URISIndexedAny> = {
  [k in URIS | URIS2]?: GenConfig<T[k], R[k]>
}

/**
 *  @since 0.0.1
 */
export interface ConfigType<E, A> {
  _E: E
  _A: A
}

/**
 *  @since 0.0.1
 */
export type ConfigsForType<R extends AnyEnv, E, A> = MapToGenConfig<R, ConfigType<E, A>>

/**
 *  @since 0.0.1
 */
export const getApplyConfig: <Uri extends URIS | URIS2>(
  uri: Uri
) => <E, A, R extends Record<typeof uri, any>>(
  config?: { [k in Uri]?: GenConfig<ConfigType<E, A>[Uri], R> }
) => GenConfig<ConfigType<E, A>[Uri], R> = uri => config => (a, r) =>
  ((config && config[uri] ? config[uri] : identity) as any)(a, r[uri])
