import type { ModelAlgebraStrMap1 } from '@morphic-ts/model-algebras/lib/str-map'
import { RecycleType, RecycleURI } from '../hkt'
import { recycleApplyConfig } from '../config'
import type { AnyEnv } from '@morphic-ts/common/lib/config'
import { memo } from '@morphic-ts/common/lib/utils'
import { getStrMap } from '../recycle'

/**
 *  @since 0.0.1
 */
export const recycleStrMapInterpreter = memo(
  <Env extends AnyEnv>(): ModelAlgebraStrMap1<RecycleURI, Env> => ({
    _F: RecycleURI,
    strMap: (getCodomain, config) => env =>
      new RecycleType(recycleApplyConfig(config)(getStrMap(getCodomain(env).recycle), env))
  })
)
