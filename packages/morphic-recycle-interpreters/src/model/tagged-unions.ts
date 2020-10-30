import type { ModelAlgebraTaggedUnions1 } from '@morphic-ts/model-algebras/lib/tagged-unions'
import { RecycleType, RecycleURI } from '../hkt'
import { mapRecord, memo } from '@morphic-ts/common/lib/utils'
import type { AnyEnv } from '@morphic-ts/common/lib/config'
import { fromRecycle } from '../recycle'

/**
 *  @since 0.0.1
 */
export const recycleTaggedUnionInterpreter = memo(
  <Env extends AnyEnv>(): ModelAlgebraTaggedUnions1<RecycleURI, Env> => ({
    _F: RecycleURI,
    taggedUnion: (tag, types, _name, _config) => env => {
      // TODO: add customize
      const recycle = mapRecord(types, a => a(env).recycle.recycle)
      return new RecycleType(
        fromRecycle((prev, next) => {
          const aTag = prev[tag]
          return aTag === next[tag] ? recycle[aTag](prev, next) : next
        })
      )
    }
  })
)
