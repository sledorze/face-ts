import type { ModelAlgebraSet1 } from '@morphic-ts/model-algebras/lib/set'
import { RecycleType, RecycleURI } from '../hkt'
import type { AnyEnv } from '@morphic-ts/common/lib/config'
import { memo } from '@morphic-ts/common/lib/utils'
import { getSet } from '../recycle'

/**
 *  @since 0.0.1
 */
export const recycleSetInterpreter = memo(
  <Env extends AnyEnv>(): ModelAlgebraSet1<RecycleURI, Env> => ({
    _F: RecycleURI,
    set: getRecycle => env => new RecycleType(getSet(getRecycle(env).recycle))
  })
)
