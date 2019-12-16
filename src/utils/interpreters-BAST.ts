import { builderInterpreter } from '../interpreters/builder/interpreters'
import { builderInterpreter as algebraInterp } from '../interpreters/algebra/interpreters'

import { Arbitrary } from 'fast-check/*'
import { fastCheckInterpreter } from '../interpreters/fast-check/interpreters'

import { Type } from 'io-ts'
import { ioTsStrict, ioTsNonStrict } from '../interpreters/io-ts/interpreters'

import { JSONSchema } from '../json-schema/json-schema'
import { jsonSchemaInterpreter } from '../interpreters/json-schema/interpreters'

import { ProgramInterpreter1 } from '../usage/materializer'
import { ProgramUnionURI } from './program'
import { either, Either } from 'fp-ts/lib/Either'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import { JsonSchemaError } from '../interpreters/json-schema'
import { Builder } from '../interpreters/builder'

interface BASTJInterpreter<E, A> {
  build: Builder<A>
  arb: Arbitrary<A>
  strictType: Type<A, unknown, unknown>
  type: Type<A, unknown, unknown>
  jsonSchema: Either<NonEmptyArray<JsonSchemaError>, JSONSchema>
}

export type BASTJInterpreterURI = 'BASTJInterpreter'

declare module '../../src/usage/interpreters-hkt' {
  interface Interpreter1<E, A> {
    BASTJInterpreter: BASTJInterpreter<E, A>
  }
}
export const BASTJInterpreter: ProgramInterpreter1<ProgramUnionURI, BASTJInterpreterURI> = program => ({
  build: program(builderInterpreter).build,
  arb: program(fastCheckInterpreter).arb,
  strictType: program(ioTsStrict).type,
  type: program(ioTsNonStrict).type,
  jsonSchema: either.map(program(jsonSchemaInterpreter).schema, s => s.json),
  algebra: program(algebraInterp).build
})
