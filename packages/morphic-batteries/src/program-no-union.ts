import { InferredAlgebra, InferredProgram } from './usage/programs-infer'
import { GetAlgebra } from '@morphic-ts/algebras/lib/core'

import { IntersectionURI } from '@morphic-ts/model-algebras/lib/intersections'
import { ObjectURI } from '@morphic-ts/model-algebras/lib/object'
import { PrimitiveURI } from '@morphic-ts/model-algebras/lib/primitives'
import { RecursiveURI } from '@morphic-ts/model-algebras/lib/recursive'
import { SetURI } from '@morphic-ts/model-algebras/lib/set'
import { StrMapURI } from '@morphic-ts/model-algebras/lib/str-map'
import { TaggedUnionsURI } from '@morphic-ts/model-algebras/lib/tagged-unions'
import { UnknownURI } from '@morphic-ts/model-algebras/lib/unknown'
import { NewtypeURI } from '@morphic-ts/model-algebras/lib/newtype'
import { RefinedURI } from '@morphic-ts/model-algebras/lib/refined'

/**
 *  @since 0.0.1
 */
export const ProgramNoUnionURI = 'ProgramNoUnionURI' as const
/**
 *  @since 0.0.1
 */
export type ProgramNoUnionURI = typeof ProgramNoUnionURI

/**
 *  @since 0.0.1
 */
export interface AlgebraNoUnion<F> extends InferredAlgebra<F, ProgramNoUnionURI> {}
/**
 *  @since 0.0.1
 */
export interface P<E, A> extends InferredProgram<E, A, ProgramNoUnionURI> {}

declare module './usage/ProgramType' {
  interface ProgramAlgebraURI {
    [ProgramNoUnionURI]: GetAlgebra<
      | PrimitiveURI
      | IntersectionURI
      | ObjectURI
      | RecursiveURI
      | SetURI
      | StrMapURI
      | TaggedUnionsURI
      | UnknownURI
      | NewtypeURI
      | RefinedURI
    >
  }

  interface ProgramAlgebra<F> {
    [ProgramNoUnionURI]: AlgebraNoUnion<F>
  }

  interface ProgramType<E, A> {
    [ProgramNoUnionURI]: P<E, A>
  }

  interface ProgramNoUnionInterpreters {}
}
