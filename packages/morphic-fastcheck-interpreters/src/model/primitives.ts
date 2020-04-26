import { FastCheckType, FastCheckURI } from '../hkt'
import { ModelAlgebraPrimitive1 } from '@morphic-ts/model-algebras/lib/primitives'
import { fromNullable } from 'fp-ts/lib/Option'
import { constant, integer, boolean, string, float, oneof, array, option, bigInt, uuid, Arbitrary } from 'fast-check'
import { fastCheckApplyConfig } from '../config'
import { AnyEnv } from '@morphic-ts/common/lib/config'
import { memo } from '@morphic-ts/common/lib/utils'
import { UUID } from 'io-ts-types/lib/UUID'
import { left, right } from 'fp-ts/lib/Either'

/**
 *  @since 0.0.1
 */
export const fastCheckPrimitiveInterpreter = memo(
  <Env extends AnyEnv>(): ModelAlgebraPrimitive1<FastCheckURI, Env> => ({
    _F: FastCheckURI,
    date: configs => env =>
      new FastCheckType(
        fastCheckApplyConfig(configs)(
          integer().map(n => new Date(n)),
          env
        )
      ),
    boolean: configs => env => new FastCheckType(fastCheckApplyConfig(configs)(boolean(), env)),
    string: configs => env => new FastCheckType(fastCheckApplyConfig(configs)(string(), env)),
    number: configs => env => new FastCheckType(fastCheckApplyConfig(configs)(float(), env)),
    bigint: configs => env => new FastCheckType(fastCheckApplyConfig(configs)(bigInt(), env)),
    stringLiteral: (l, config) => env => new FastCheckType(fastCheckApplyConfig(config)(constant(l), env)),
    keysOf: (k, config) => env =>
      new FastCheckType(
        fastCheckApplyConfig(config)(oneof(...(Object.keys(k) as (keyof typeof k)[]).map(constant)), env)
      ),
    nullable: (T, config) => env =>
      new FastCheckType(fastCheckApplyConfig(config)(option(T(env).arb).map(fromNullable), env)),
    array: (T, config) => env => new FastCheckType(fastCheckApplyConfig(config)(array(T(env).arb), env)),
    uuid: config => env => new FastCheckType(fastCheckApplyConfig(config)(uuid() as Arbitrary<UUID>, env)),
    either: (e, a, config) => env =>
      new FastCheckType(fastCheckApplyConfig(config)(oneof(e(env).arb.map(left), a(env).arb.map(right) as any), env))
  })
)
