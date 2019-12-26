import * as t from 'io-ts'
import { InterpreterFor } from '../../core'
import { IOTSType, IoTsURI } from '.'
import { ModelAlgebraObject1, PropsKind1 } from '../../algebras/object'
import { merge, projectField } from '../../utils'
import { ioTsPrimitiveInterpreter } from './primitives'
import { ioTsIntersectionInterpreter } from './intersections'
import { ioTsUnionInterpreter } from './unions'
import { ioTsTaggedUnionInterpreter } from './tagged-unions'
import { ioTsStrMapInterpreter } from './str-map'
import { ioTsSetInterpreter } from './set'

import { ioTsRecursiveInterpreter } from './recursive'
export { IoTsURI }

export type IOTypes<Props> = { [k in keyof Props]: t.Type<Props[k], unknown> }

export const ioTsNonStrictObjectInterpreter: ModelAlgebraObject1<IoTsURI> = {
  interface: <Props>(props: PropsKind1<IoTsURI, Props>, name: string) =>
    new IOTSType<Props>((t.type(projectField(props)('type'), name) as t.Type<any, unknown>) as t.Type<Props, unknown>),
  partial: <Props>(props: PropsKind1<IoTsURI, Props>, name: string) =>
    new IOTSType<Partial<Props>>(t.partial(projectField(props)('type'), name))
}

export const ioTsStrictObjectInterpreter: ModelAlgebraObject1<IoTsURI> = {
  interface: <Props>(props: PropsKind1<IoTsURI, Props>, name: string) =>
    new IOTSType<Props>(
      (t.strict(projectField(props)('type'), name) as t.Type<any, unknown>) as t.Type<Props, unknown>
    ),
  partial: <Props>(props: PropsKind1<IoTsURI, Props>, name: string) =>
    new IOTSType<Partial<Props>>(t.exact(t.partial(projectField(props)('type'), name)))
}

const base = merge(
  ioTsPrimitiveInterpreter,
  ioTsIntersectionInterpreter,
  ioTsUnionInterpreter,
  ioTsTaggedUnionInterpreter,
  ioTsStrMapInterpreter,
  ioTsSetInterpreter,
  ioTsRecursiveInterpreter
)

export const ioTsStrict = InterpreterFor(IoTsURI)(
  merge(
    base,
    ioTsStrictObjectInterpreter // Strict
  )
)

export const defineIoTsInterpreter = InterpreterFor(IoTsURI)

export const ioTsNonStrict = defineIoTsInterpreter(
  merge(
    base,
    ioTsNonStrictObjectInterpreter // NonStrict
  )
)
