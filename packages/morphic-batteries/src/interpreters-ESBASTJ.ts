import type { Eq } from 'fp-ts/lib/Eq'
import type { Show } from 'fp-ts/lib/Show'
import type { Arbitrary } from 'fast-check/*'
import type { Type } from 'io-ts'

import type { JSONSchema } from '@morphic-ts/json-schema-interpreters/lib/json-schema/json-schema'
import type { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import type { NamedSchemas } from '@morphic-ts/json-schema-interpreters/lib/index'
import type { JsonSchemaError } from '@morphic-ts/json-schema-interpreters/lib/json-schema/json-schema-ctors'
import type { Create } from '@morphic-ts/io-ts-interpreters/lib/create'
import type { Either } from 'fp-ts/lib/Either'

/**
 *  @since 0.0.1
 */
export const ESBASTJInterpreterURI = 'ESBASTJInterpreterURI' as const
/**
 *  @since 0.0.1
 */
export type ESBASTJInterpreterURI = typeof ESBASTJInterpreterURI

interface ESBASTJInterpreter<E, A> {
  build: (a: A) => A
  eq: Eq<A>
  show: Show<A>
  arb: Arbitrary<A>
  strictType: Type<A, E, unknown>
  type: Type<A, E, unknown>
  jsonSchema: Either<NonEmptyArray<JsonSchemaError>, [JSONSchema, NamedSchemas]>
  create: Create<A>
}

declare module './usage/InterpreterResult' {
  interface InterpreterResult<E, A> {
    [ESBASTJInterpreterURI]: ESBASTJInterpreter<E, A>
  }
}
