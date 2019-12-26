import * as fc from 'fast-check'
import { FastCheckType, FastCheckURI } from '.'
import { ModelAlgebraPrimitive1 } from '../../algebras/primitives'
import { fromNullable } from 'fp-ts/lib/Option'
import { identity } from 'fp-ts/lib/function'

declare module '../../algebras/hkt' {
  interface PrimitiveArrayConfig<A> {
    [FastCheckURI]: MinMaxLength | undefined
  }
  interface PrimitiveConfig {
    [FastCheckURI]: Customize<string> | undefined
  }
  export interface PrimitiveDateConfig {
    [FastCheckURI]: Customize<Date> | undefined
  }
  export interface PrimitiveStringConfig {
    [FastCheckURI]: Customize<string> | undefined
  }
  export interface PrimitiveNumberConfig {
    [FastCheckURI]: Customize<number> | undefined
  }
  export interface PrimitiveBooleanConfig {
    [FastCheckURI]: Customize<boolean> | undefined
  }
}

interface MinMaxLength {
  maxLength: number
  minLength?: number
}
interface Customize<A> {
  (a: fc.Arbitrary<A>): fc.Arbitrary<A>
}

const applyCustomize = <A>(c: { [FastCheckURI]?: Customize<A> } | undefined) =>
  c !== undefined ? c[FastCheckURI] ?? identity : identity

export const fastCheckPrimitiveInterpreter: ModelAlgebraPrimitive1<FastCheckURI> = {
  date: configs => new FastCheckType(applyCustomize(configs)(fc.integer().map(n => new Date(n)))),
  boolean: configs => new FastCheckType(applyCustomize(configs)(fc.boolean())),
  string: configs => new FastCheckType(applyCustomize(configs)(fc.string())),
  number: configs => new FastCheckType(applyCustomize(configs)(fc.float())),
  stringLiteral: l => new FastCheckType(fc.constant(l)),
  keysOf: k => new FastCheckType(fc.oneof(...(Object.keys(k) as (keyof typeof k)[]).map(k => fc.constant(k)))),
  nullable: T => new FastCheckType(fc.option(T.arb).map(fromNullable)),
  array: (T, configs) => {
    const config = configs !== undefined ? configs[FastCheckURI] : undefined
    return new FastCheckType(
      config !== undefined ? fc.array(T.arb, config.minLength ?? 0, config.maxLength) : fc.array(T.arb)
    )
  }
}
