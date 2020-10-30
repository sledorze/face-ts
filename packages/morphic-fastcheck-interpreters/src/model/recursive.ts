import { FastCheckType, FastCheckURI } from '../hkt'
import type { ModelAlgebraRecursive1 } from '@morphic-ts/model-algebras/lib/recursive'
import { memo } from '@morphic-ts/common/lib/utils'
import { constant } from 'fast-check'
import type { AnyEnv } from '@morphic-ts/common/lib/config'

/**
 *  @since 0.0.1
 */
export const fastCheckRecursiveInterpreter = memo(
  <Env extends AnyEnv>(): ModelAlgebraRecursive1<FastCheckURI, Env> => ({
    _F: FastCheckURI,
    recursive: f => {
      type FA = ReturnType<typeof f>
      const get = memo(() => f(res))
      const res: FA = env => {
        const getArb = memo(() => get()(env))
        return new FastCheckType(constant(null).chain(_ => getArb().arb))
      }
      return res
    }
  })
)
