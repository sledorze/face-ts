import { genericTuple } from 'fast-check'
import { FastCheckType, FastCheckURI } from '../hkt'
import type { ModelAlgebraIntersection1 } from '@morphic-ts/model-algebras/lib/intersections'
import type { AnyEnv } from '@morphic-ts/common/lib/config'
import { memo } from '@morphic-ts/common/lib/utils'

/**
 *  @since 0.0.1
 */
export const fastCheckIntersectionInterpreter = memo(
  <Env extends AnyEnv>(): ModelAlgebraIntersection1<FastCheckURI, Env> => ({
    _F: FastCheckURI,
    intersection: <A>(items: ((env: Env) => FastCheckType<A>)[]) => (env: Env) =>
      new FastCheckType(genericTuple(items.map(getArb => getArb(env).arb)).map(all => Object.assign({}, ...all)))
  })
)
