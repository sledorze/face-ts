import { RecycleType, RecycleURI } from '../hkt'
import type { ModelAlgebraRecursive1 } from '@morphic-ts/model-algebras/lib/recursive'
import { memo } from '@morphic-ts/common/lib/utils'
import type { AnyEnv } from '@morphic-ts/common/lib/config'

/**
 *  @since 0.0.1
 */
export const recycleRecursiveInterpreter = memo(
  <Env extends AnyEnv>(): ModelAlgebraRecursive1<RecycleURI, Env> => ({
    _F: RecycleURI,
    recursive: a => {
      const get = memo(() => a(res))
      const res: ReturnType<typeof a> = env => {
        const getRecycle = memo(() => get()(env).recycle.recycle)
        return new RecycleType({ recycle: (prev, next) => getRecycle()(prev, next) })
      }
      return res
    }
  })
)
