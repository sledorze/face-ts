import { identity } from 'fp-ts/lib/function'
import { cacheUnaryFunction, Compact } from '@morphic-ts/common/lib/core'

import { modelEqInterpreter, EqURI } from '@morphic-ts/eq-interpreters/lib/interpreters'
import { modelShowInterpreter, ShowURI } from '@morphic-ts/show-interpreters/lib/interpreters'
import { modelIoTsNonStrictInterpreter, IoTsURI } from '@morphic-ts/io-ts-interpreters/lib/interpreters'

import * as U from './usage'

import { ProgramNoUnionURI } from './program-no-union'
import { ESBSTInterpreterURI } from './interpreters-ESBST'
import { Includes, Only } from '@morphic-ts/common/lib/utils'
import { DepsErrorMsg, AnyConfigEnv, ExtractEnv } from './usage/summoner'

/** Type level override to keep Morph type name short */
/**
 *  @since 0.0.1
 */
export interface M<R, L, A> extends U.Materialized<R, L, A, ProgramNoUnionURI, ESBSTInterpreterURI> {}
/**
 *  @since 0.0.1
 */
export interface UM<R, A> extends M<R, unknown, A> {}

/**
 *  @since 0.0.1
 */
export const AsOpaque = <E, A>() => <X extends M<any, E, A>>(x: X): M<X['_R'], E, A> => x
/**
 *  @since 0.0.1
 */
export const AsUOpaque = <A>() => <X extends UM<any, A>>(x: X): UM<X['_R'], A> => x

/**
 *  @since 0.0.1
 */
export interface Summoner<R> extends U.Summoners<ProgramNoUnionURI, ESBSTInterpreterURI, R> {
  <L, A, R2 extends R>(F: U.ProgramType<R2, L, A>[ProgramNoUnionURI]): Includes<
    Only<R>,
    R2,
    M<R, L, A>,
    Compact<DepsErrorMsg<R, R2>>
  >
}

export const summonFor = <R extends AnyConfigEnv>(env: ExtractEnv<R, EqURI | ShowURI | IoTsURI>) =>
  U.makeSummoner<Summoner<R>>(cacheUnaryFunction, program => ({
    build: identity,
    eq: program(modelEqInterpreter)(env).eq,
    show: program(modelShowInterpreter)(env).show,
    strictType: program(modelIoTsNonStrictInterpreter)(env).type,
    type: program(modelIoTsNonStrictInterpreter)(env).type
  }))
