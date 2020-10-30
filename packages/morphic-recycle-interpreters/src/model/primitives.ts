import type { ModelAlgebraPrimitive1 } from '@morphic-ts/model-algebras/lib/primitives'
import { RecycleType, RecycleURI } from '../hkt'
import { recycleApplyConfig } from '../config'
import type { AnyEnv } from '@morphic-ts/common/lib/config'
import { memo } from '@morphic-ts/common/lib/utils'
import type { UUID } from 'io-ts-types/lib/UUID'
import * as R from '../recycle'

/**
 *  @since 0.0.1
 */
export const recyclePrimitiveInterpreter = memo(
  <Env extends AnyEnv>(): ModelAlgebraPrimitive1<RecycleURI, Env> => ({
    _F: RecycleURI,
    date: config => env =>
      new RecycleType(
        recycleApplyConfig(config)(
          R.contramap(R.recycleNumber, (date: Date) => date.getTime()),
          env
        )
      ),
    boolean: config => env => new RecycleType(recycleApplyConfig(config)(R.recycleBoolean, env)),
    string: config => env => new RecycleType(recycleApplyConfig(config)(R.recycleString, env)),
    number: config => env => new RecycleType(recycleApplyConfig(config)(R.recycleNumber, env)),
    bigint: config => env => new RecycleType<bigint>(recycleApplyConfig(config)(R.recycleBigint, env)),
    stringLiteral: (k, config) => env =>
      new RecycleType<typeof k>(recycleApplyConfig(config)(R.recyclePrimitive(), env)),
    keysOf: (keys, config) => env =>
      new RecycleType<keyof typeof keys>(recycleApplyConfig(config)(R.recyclePrimitive(), env)),
    nullable: (getType, config) => env =>
      new RecycleType(recycleApplyConfig(config)(R.getOption(getType(env).recycle), env)),
    array: (getType, config) => env =>
      new RecycleType(recycleApplyConfig(config)(R.getArray(getType(env).recycle), env)),
    uuid: config => env => new RecycleType<UUID>(recycleApplyConfig(config)(R.recyclePrimitive(), env)),
    either: (e, a, config) => env =>
      new RecycleType(recycleApplyConfig(config)(R.getEither(e(env).recycle, a(env).recycle), env)),
    option: (a, config) => env => new RecycleType(recycleApplyConfig(config)(R.getOption(a(env).recycle), env))
  })
)
