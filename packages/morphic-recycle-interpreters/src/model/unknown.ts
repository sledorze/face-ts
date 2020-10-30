import type { ModelAlgebraUnknown1 } from '@morphic-ts/model-algebras/lib/unknown'
import { RecycleType, RecycleURI } from '../hkt'
import { recycleApplyConfig } from '../config'
import type { AnyEnv } from '@morphic-ts/common/lib/config'
import { memo } from '@morphic-ts/common/lib/utils'
import { recyclePrimitive } from '../recycle'

/**
 *  @since 0.0.1
 */
export const recycleUnknownInterpreter = memo(
  <Env extends AnyEnv>(): ModelAlgebraUnknown1<RecycleURI, Env> => ({
    _F: RecycleURI,
    unknown: cfg => env => {
      const config = recycleApplyConfig(cfg)
      return new RecycleType(config(recyclePrimitive(), env)) // TODO: default to a better alternative
    }
  })
)
