import { merge, memo } from '@morphic-ts/common/lib/utils'
import { recycleRefinedInterpreter } from './model/refined'
import { recycleNewtypeInterpreter } from './model/newtype'
import { recycleUnknownInterpreter } from './model/unknown'
import { recyclePrimitiveInterpreter } from './model/primitives'
import { recycleIntersectionInterpreter } from './model/intersections'
import { recycleObjectInterpreter } from './model/object'
import { recycleTaggedUnionInterpreter } from './model/tagged-unions'
import { recycleRecursiveInterpreter } from './model/recursive'
import { recycleStrMapInterpreter } from './model/str-map'
import { recycleSetInterpreter } from './model/set'
import type { AnyEnv } from '@morphic-ts/common/lib/config'
export * from './hkt'

/**
 *  @since 0.0.1
 */
const allModelRecycle = <Env extends AnyEnv>() =>
  merge(
    recycleRefinedInterpreter<Env>(),
    recycleNewtypeInterpreter<Env>(),
    recycleUnknownInterpreter<Env>(),
    recyclePrimitiveInterpreter<Env>(),
    recycleIntersectionInterpreter<Env>(),
    recycleObjectInterpreter<Env>(),
    recycleTaggedUnionInterpreter<Env>(),
    recycleRecursiveInterpreter<Env>(),
    recycleStrMapInterpreter<Env>(),
    recycleSetInterpreter<Env>()
  )

/**
 *  @since 0.0.1
 */
export const modelRecycleInterpreter = memo(allModelRecycle) as typeof allModelRecycle
