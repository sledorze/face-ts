import type { InterpreterResult, InterpreterURI } from './InterpreterResult'
import { assignFunction, wrapFun, assignCallable, inhabitTypes } from './utils'
import type { InhabitedTypes } from './utils'
import { MonocleFor } from '@morphic-ts/adt/lib/monocle'
import type { ProgramURI, ProgramType } from './ProgramType'
import { interpretable } from './programs-infer'
import type { Overloads } from './programs-infer'

/**
 *  @since 0.0.1
 */
export interface ProgramInterpreter<ProgURI extends ProgramURI, InterpURI extends InterpreterURI> {
  <R, E, A>(program: ProgramType<R, E, A>[ProgURI]): InterpreterResult<E, A>[InterpURI]
}

/**
 *  @since 0.0.1
 */
export type Morph<R, E, A, InterpURI extends InterpreterURI, ProgURI extends ProgramURI> = InterpreterResult<
  E,
  A
>[InterpURI] &
  ProgramType<R, E, A>[ProgURI] &
  MorphExtra<R, E, A, InterpURI, ProgURI>

/**
 *  @since 0.0.1
 */
export interface MorphExtra<R, E, A, InterpURI extends InterpreterURI, ProgURI extends ProgramURI>
  extends InhabitedTypes<R, E, A>,
    InhabitedInterpreterAndAlbegra<ProgURI, InterpURI>,
    Interpretable<R, E, A, ProgURI> {}

const inhabitInterpreterAndAlbegra = <ProgURI extends ProgramURI, InterpURI extends InterpreterURI, T>(
  t: T
): T & InhabitedInterpreterAndAlbegra<ProgURI, InterpURI> => t as T & InhabitedInterpreterAndAlbegra<ProgURI, InterpURI>

/**
 *  @since 0.0.1
 */
export interface InhabitedInterpreterAndAlbegra<ProgURI extends ProgramURI, InterpURI extends InterpreterURI> {
  _P: ProgURI
  _I: InterpURI
}

function interpreteWithProgram<R, E, A, ProgURI extends ProgramURI, InterpURI extends InterpreterURI>(
  program: ProgramType<R, E, A>[ProgURI],
  programInterpreter: ProgramInterpreter<ProgURI, InterpURI>
): Morph<R, E, A, InterpURI, ProgURI> & InhabitedTypes<R, E, A> {
  return inhabitInterpreterAndAlbegra(
    inhabitTypes(assignFunction(wrapFun(program as any), programInterpreter(program)))
  ) // FIXME: resolve any
}

interface Interpretable<R, E, A, ProgURI extends ProgramURI> {
  derive: Overloads<ProgramType<R, E, A>[ProgURI]>
}

/**
 *  @since 0.0.1
 */
export type Materialized<R, E, A, ProgURI extends ProgramURI, InterpURI extends InterpreterURI> = Morph<
  R,
  E,
  A,
  InterpURI,
  ProgURI
> &
  MonocleFor<A>

/**
 *  @since 0.0.1
 */
export function materialize<R, E, A, ProgURI extends ProgramURI, InterpURI extends InterpreterURI>(
  program: ProgramType<R, E, A>[ProgURI],
  programInterpreter: ProgramInterpreter<ProgURI, InterpURI>
): Materialized<R, E, A, ProgURI, InterpURI> {
  const morph = interpreteWithProgram(program, programInterpreter)
  return assignCallable(morph, {
    ...MonocleFor<A>(),
    derive: interpretable(morph)
  })
}
