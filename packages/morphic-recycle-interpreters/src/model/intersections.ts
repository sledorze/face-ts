import type { ModelAlgebraIntersection1 } from '@morphic-ts/model-algebras/lib/intersections'
import { RecycleType, RecycleURI } from '../hkt'
import type { AnyEnv } from '@morphic-ts/common/lib/config'
import { memo } from '@morphic-ts/common/lib/utils'
import { fromRecycle } from '../recycle'

/**
 * Recycles an intersection
 *
 * @since 0.0.1
 */
export const recycleIntersectionInterpreter = memo(
  <Env extends AnyEnv>(): ModelAlgebraIntersection1<RecycleURI, Env> => ({
    _F: RecycleURI,
    intersection: <A>(types: ((env: Env) => RecycleType<A>)[]) => (env: Env) => {
      const recycles = types.map(getRecycle => getRecycle(env).recycle.recycle)
      return new RecycleType<A>(
        /**
         * Recycling an intersection involves calculating the recycling of each parts.
         *
         * By nature, each recycle application will consider only part of the result value
         * Depending on its (partial) check will eventually results the previous value, next value OR a new value including only the partial value
         * if any of the result is the next value; the end result must be the next value overriden by the partial results
         *    ^ in this case, we can miss some recycling from previous but the natural opacity of intersection is a blocker for us at this point
         * if none of the result is the next value; the end result must be the previous value overriden by the partial results
         */

        fromRecycle((prev: A, next: A) => {
          let isBasePrevious = true
          // TODO: Optimise with presize
          const partials: unknown[] = []

          for (const recycle of recycles) {
            const res = recycle(prev, next)
            if (res === next) {
              isBasePrevious = false
            } else {
              if (res !== prev) {
                partials.push(res)
              }
            }
          }

          const base = isBasePrevious ? prev : next
          return partials.length > 0 ? Object.assign({}, ...[base, ...partials]) : base
        })
      )
    }
  })
)
