import type { ModelAlgebraIntersection1 } from '@morphic-ts/model-algebras/lib/intersections'
import type { AnyEnv } from '@morphic-ts/common/lib/config'

import { JsonSchema, JsonSchemaURI } from '../hkt'
import { IntersectionTypeCtor } from '../json-schema/json-schema-ctors'
import { pipe } from 'fp-ts/lib/pipeable'
import { chain as SEchain, chainEitherK as SEchainEitherK } from 'fp-ts-contrib/lib/StateEither'
import { arrayTraverseStateEither, resolveRef, registerSchema } from '../utils'
import { memo } from '@morphic-ts/common/lib/utils'

/**
 *  @since 0.0.1
 */
export const jsonSchemaIntersectionInterpreter = memo(
  <Env extends AnyEnv>(): ModelAlgebraIntersection1<JsonSchemaURI, Env> => ({
    _F: JsonSchemaURI,
    intersection: <A>(types: Array<(env: Env) => JsonSchema<A>>, name: string) => (env: Env) =>
      new JsonSchema<A>(
        pipe(
          arrayTraverseStateEither(types, getShema => getShema(env).schema),
          SEchain(schemas => arrayTraverseStateEither(schemas, resolveRef)),
          SEchainEitherK(IntersectionTypeCtor),
          SEchain(registerSchema(name))
        )
      )
  })
)
