import { option, array } from 'fp-ts'
import { eq, eqNumber, eqString, eqBoolean, eqStrict } from 'fp-ts/lib/Eq'
import { ModelAlgebraPrimitive1 } from '@morphic-ts/model-algebras/lib/primitives'
import { EqType, EqURI } from '../hkt'

/**
 *  @since 0.0.1
 */
export const eqPrimitiveInterpreter: ModelAlgebraPrimitive1<EqURI> = {
  _F: EqURI,
  date: _ => new EqType(eq.contramap(eqNumber, (date: Date) => date.getTime())),
  boolean: _ => new EqType(eqBoolean),
  string: _ => new EqType(eqString),
  number: _ => new EqType(eqNumber),
  bigint: _ => new EqType<bigint>({ equals: eqStrict.equals }),
  stringLiteral: <T extends string>(_: T) => new EqType<T>(eqString),
  keysOf: _keys => new EqType<keyof typeof _keys>({ equals: eqStrict.equals }),
  nullable: ({ eq }) => new EqType(option.getEq(eq)),
  array: ({ eq }) => new EqType(array.getEq(eq))
}
