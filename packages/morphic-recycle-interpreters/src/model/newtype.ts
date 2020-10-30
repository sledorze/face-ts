import type { ModelAlgebraNewtype1 } from '@morphic-ts/model-algebras/lib/newtype'
import { RecycleURI, RecycleType } from '../hkt'
import { recycleApplyConfig } from '../config'
import type { AnyEnv } from '@morphic-ts/common/lib/config'
import { memo } from '@morphic-ts/common/lib/utils'

/**
 *  @since 0.0.1
 */
export const recycleNewtypeInterpreter = memo(
  <Env extends AnyEnv>(): ModelAlgebraNewtype1<RecycleURI, Env> => ({
    _F: RecycleURI,
    newtype: () => (getRecycle, config) => env =>
      new RecycleType(recycleApplyConfig(config)(getRecycle(env).recycle, env))
  })
)
