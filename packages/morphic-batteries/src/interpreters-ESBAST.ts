import { Eq } from 'fp-ts/lib/Eq'
import { modelEqInterpreter } from '@morphic-ts/eq-interpreters/lib/interpreters'

import { Show } from 'fp-ts/lib/Show'
import { modelShowInterpreter } from '@morphic-ts/show-interpreters/lib/interpreters'
import { Arbitrary } from 'fast-check/*'
import { modelFastCheckInterpreter } from '@morphic-ts/fastcheck-interpreters/lib/interpreters'
import { Type } from 'io-ts'
import { identity } from 'fp-ts/lib/function'
import { modelIoTsNonStrictInterpreter } from '@morphic-ts/io-ts-interpreters/lib/interpreters'
import { ProgramInterpreter, Materialized } from './usage/materializer'
import { interpretable } from './usage/programs-infer'
import { ProgramType } from './usage/ProgramType'
import { Summoners } from './usage/summoner'
import { ProgramNoUnionURI } from './program-no-union'

interface ESBASTInterpreter<E, A> {
  build: (a: A) => A
  eq: Eq<A>
  show: Show<A>
  arb: Arbitrary<A>
  strictType: Type<A, E, unknown>
  type: Type<A, E, unknown>
}

/**
 *  @since 0.0.1
 */
export const ESBASTInterpreterURI = 'ESBASTInterpreterURI' as const
/**
 *  @since 0.0.1
 */
export type ESBASTInterpreterURI = typeof ESBASTInterpreterURI

/**
 *  @since 0.0.1
 */
export const ESBASTInterpreter: ProgramInterpreter<ProgramNoUnionURI, ESBASTInterpreterURI> = _program => {
  const program = interpretable(_program)
  return {
    build: identity,
    eq: program(modelEqInterpreter).eq,
    show: program(modelShowInterpreter).show,
    arb: program(modelFastCheckInterpreter).arb,
    strictType: program(modelIoTsNonStrictInterpreter).type,
    type: program(modelIoTsNonStrictInterpreter).type
  }
}

declare module './usage/InterpreterResult' {
  interface InterpreterResult<E, A> {
    [ESBASTInterpreterURI]: ESBASTInterpreter<E, A>
  }
}
declare module './usage/ProgramType' {
  interface ProgramTInterpreters {
    [ESBASTInterpreterURI]: Summoner
  }
}

/** Type level override to keep Morph type name short */
/**
 *  @since 0.0.1
 */
export interface M<L, A> extends Materialized<L, A, ProgramNoUnionURI, ESBASTInterpreterURI> {}
/**
 *  @since 0.0.1
 */
export interface UM<A> extends Materialized<unknown, A, ProgramNoUnionURI, ESBASTInterpreterURI> {}

/**
 *  @since 0.0.1
 */
export const AsOpaque = <E, A>(x: M<E, A>): M<E, A> => x
/**
 *  @since 0.0.1
 */
export const AsUOpaque = <A>(x: UM<A>): UM<A> => x

/**
 *  @since 0.0.1
 */
export interface MorphAs {
  <L, A>(F: ProgramType<L, A>[ProgramNoUnionURI]): M<L, A>
}
/**
 *  @since 0.0.1
 */
export interface MorphAsA {
  <A>(): <L>(F: ProgramType<L, A>[ProgramNoUnionURI]) => M<L, A>
}
/**
 *  @since 0.0.1
 */
export interface MorphAsL {
  <L>(): <A>(F: ProgramType<L, A>[ProgramNoUnionURI]) => M<L, A>
}
/**
 *  @since 0.0.1
 */
export interface Morph {
  <A>(F: ProgramType<unknown, A>[ProgramNoUnionURI]): UM<A>
}

/**
 *  @since 0.0.1
 */
export interface Summoner extends Summoners<ProgramNoUnionURI, ESBASTInterpreterURI> {
  summonAs: MorphAs
  summonAsA: MorphAsA
  summonAsL: MorphAsL
  summon: Morph
}
