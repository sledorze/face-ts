import { cacheUnaryFunction } from '@morphic-ts/common/lib/core'
import { makeSummoner } from './usage/summoner'
import { makeTagged } from './usage/tagged-union'
import { TInterpreter, M, UM, AsOpaque, AsUOpaque } from './interpreters-T'

export {} from '@morphic-ts/io-ts-interpreters/lib'
export {} from '@morphic-ts/eq-interpreters/lib'
export {} from '@morphic-ts/fastcheck-interpreters/lib'
export {} from '@morphic-ts/show-interpreters/lib'

const summon = makeSummoner(cacheUnaryFunction, TInterpreter)
const tagged = makeTagged(summon)
export {
  /**
   *  @since 0.0.1
   */
  M,
  /**
   *  @since 0.0.1
   */
  UM,
  /**
   *  @since 0.0.1
   */
  AsOpaque,
  /**
   *  @since 0.0.1
   */
  AsUOpaque,
  /**
   *  @since 0.0.1
   */
  summon,
  /**
   *  @since 0.0.1
   */
  tagged
}
