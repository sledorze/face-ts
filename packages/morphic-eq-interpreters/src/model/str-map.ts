import { getEq as RgetEq } from 'fp-ts/lib/Record'
import type { ModelAlgebraStrMap1 } from '@morphic-ts/model-algebras/lib/str-map'
import { EqType, EqURI } from '../hkt'
import { eqApplyConfig } from '../config'
import type { AnyEnv } from '@morphic-ts/common/lib/config'
import { memo } from '@morphic-ts/common/lib/utils'

/**
 *  @since 0.0.1
 */
export const eqStrMapInterpreter = memo(
  <Env extends AnyEnv>(): ModelAlgebraStrMap1<EqURI, Env> => ({
    _F: EqURI,
    strMap: (getCodomain, config) => env => new EqType(eqApplyConfig(config)(RgetEq(getCodomain(env).eq), env))
  })
)
