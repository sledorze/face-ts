import { Kind, URIS, URIS2, Kind2, HKT2 } from '../../src/HKT'
import { GetAlgebra, Algebra, Algebra1, Algebra2 } from '../core'
import { interpretSymb } from '../usage/programs-hkt'
import { IntersectionURI } from '../algebras/intersections'
import { ObjectURI } from '../algebras/object'
import { PrimitiveURI } from '../algebras/primitives'
import { RecursiveURI } from '../algebras/recursive'
import { SetURI } from '../algebras/set'
import { StrMapURI } from '../algebras/str-map'
import { TaggedUnionsURI } from '../algebras/tagged-unions'
import { UnionsURI } from '../algebras/unions'

type AllAlgebra = GetAlgebra<
  PrimitiveURI | IntersectionURI | ObjectURI | RecursiveURI | SetURI | StrMapURI | TaggedUnionsURI | UnionsURI
>

export interface AlgebraUnion<F> extends Algebra<AllAlgebra, F> {}
export interface AlgebraUnion1<F extends URIS> extends Algebra1<AllAlgebra, F> {}
export interface AlgebraUnion2<F extends URIS2> extends Algebra2<AllAlgebra, F> {}

export const ProgramUnionURI = Symbol()
export type ProgramUnionURI = typeof ProgramUnionURI

export interface ProgramUnion<E, A> {
  <G extends URIS>(a: AlgebraUnion1<G>): Kind<G, A>
  <G extends URIS2>(a: AlgebraUnion2<G>): Kind2<G, E, A>
}
export interface P<E, A> {
  <G>(a: AlgebraUnion<G>): HKT2<G, E, A>
  [interpretSymb]?: ProgramUnion<E, A>
}

declare module '../../src/usage/programs-hkt' {
  interface Program<E, A> {
    [ProgramUnionURI]: P<E, A>
  }

  interface ProgramTypes extends Record<ProgramURI, any> {
    [ProgramUnionURI]: ProgramUnionInterpreters
  }
  interface ProgramUnionInterpreters {}

  interface AllProgram<E, A> {
    [ProgramUnionURI]: ProgramUnion<E, A>
  }
}
