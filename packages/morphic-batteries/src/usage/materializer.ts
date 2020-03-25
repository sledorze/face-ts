import { InterpreterResult, InterpreterURI } from './InterpreterResult'
import { assignFunction, wrapFun, assignCallable, InhabitedTypes, inhabitTypes } from './utils'
import { MonocleFor } from '@morphic-ts/adt/lib/monocle'
import { ProgramURI, ProgramType } from './ProgramType'
import { interpretable, Overloads } from './programs-infer'

/**
 *  @since 0.0.1
 */
export interface ProgramInterpreter<ProgURI extends ProgramURI, InterpURI extends InterpreterURI> {
  <E, A>(program: ProgramType<E, A>[ProgURI]): InterpreterResult<E, A>[InterpURI]
}
/**
 *  @since 0.0.1
 */
export type ProgramURIOfProgramInterpreter<X extends ProgramInterpreter<any, any>> = X extends ProgramInterpreter<
  infer P,
  any
>
  ? P
  : never

/**
 *  @since 0.0.1
 */
export type InterpreterURIOfProgramInterpreter<X extends ProgramInterpreter<any, any>> = X extends ProgramInterpreter<
  any,
  infer R
>
  ? R
  : never

/**
 *  @since 0.0.1
 */
export type Morph<E, A, InterpURI extends InterpreterURI, ProgURI extends ProgramURI> = InterpreterResult<
  E,
  A
>[InterpURI] &
  ProgramType<E, A>[ProgURI] &
  InhabitedInterpreterAndAlbegra<ProgURI, InterpURI>

const inhabitInterpreterAndAlbegra = <ProgURI extends ProgramURI, InterpURI extends InterpreterURI, T>(
  t: T
): T & InhabitedInterpreterAndAlbegra<ProgURI, InterpURI> => t as T & InhabitedInterpreterAndAlbegra<ProgURI, InterpURI>

interface InhabitedInterpreterAndAlbegra<ProgURI extends ProgramURI, InterpURI extends InterpreterURI> {
  _P: ProgURI
  _I: InterpURI
}

function interpreteWithProgram<E, A, ProgURI extends ProgramURI, InterpURI extends InterpreterURI>(
  program: ProgramType<E, A>[ProgURI],
  programInterpreter: ProgramInterpreter<ProgURI, InterpURI>
): Morph<E, A, InterpURI, ProgURI> & InhabitedTypes<E, A> {
  return inhabitInterpreterAndAlbegra(inhabitTypes(assignFunction(wrapFun(program), programInterpreter(program))))
}

interface Interpretable<E, A, ProgURI extends ProgramURI> {
  derive: Overloads<ProgramType<E, A>[ProgURI]>
}

/**
 *  @since 0.0.1
 */
export type Materialized<E, A, ProgURI extends ProgramURI, InterpURI extends InterpreterURI> = Morph<
  E,
  A,
  InterpURI,
  ProgURI
> &
  MonocleFor<A> &
  InhabitedTypes<E, A> &
  InhabitedInterpreterAndAlbegra<ProgURI, InterpURI> &
  Interpretable<E, A, ProgURI>

/**
 *  @since 0.0.1
 */
export function materialize<E, A, ProgURI extends ProgramURI, InterpURI extends InterpreterURI>(
  program: ProgramType<E, A>[ProgURI],
  programInterpreter: ProgramInterpreter<ProgURI, InterpURI>
): Materialized<E, A, ProgURI, InterpURI> {
  const morph = interpreteWithProgram(program, programInterpreter)
  return assignCallable(morph, { ...MonocleFor<A>(), derive: interpretable(morph) })
}
