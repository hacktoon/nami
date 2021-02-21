import { Point } from '/lib/base/point'
import { Color } from '/lib/base/color'
import { clamp } from '/lib/base/number'


export class Schema {
    constructor(...types) {
        this.types = types
    }

    get size() {
        return this.types.length
    }

    has(name) {
        for(let type of this.types) {
            if (type.name === name) return true
        }
        return false
    }

    parseForm(inputs) {
        const entries = Array.from(inputs)
            // check if input was defined in schema
            .filter(input => this.has(input.name))
            .map(input => [input.name, input.value])
        return new Map(entries)
    }

    parse(rawData=new Map()) {
        const map = new Map()
        // const instance = new SchemaInstance(this)
        for(let type of this.types) {
            const name = type.name
            let value = type.defaultValue
            if (rawData.has(name)) {
                const rawValue = rawData.get(name)
                value = type.parse(rawValue)
            }
            map.set(name, value)
        }
        return map
    }
}


class SchemaInstance {
    constructor(schema) {
        this.schema = schema
        this.values = new Map()
        this.types = schema.types
    }

    get size() {
        return this.values.size
    }

    set(name, value) {
        return this.values.set(name, value)
    }

    get(name) {
        return this.values.get(name)
    }

    entries() {
        return this.values.entries()
    }
}


// let's create our own type system, it's fun
class BaseType {
    constructor(type, name, label, props) {
        const {default: _default, ..._props} = props
        this.type = type
        this.name = name
        this.label = label
        this.defaultValue = _default
        this.props = _props
    }

    static define(TypeClass) {
        // Example: Type.number('foobar', 'Foobar param', {default: 42})
        return (name, label, props={}) => {
            const type = TypeClass.type
            return new TypeClass(type, name, label, props)
        }
    }

    parse(value) {
        return value
    }
}


export class TextType extends BaseType {
    static type = 'text'

    parse(value) {
        return String(value ?? this.defaultValue)
    }
}


export class NumberType extends TextType {
    static type = 'number'

    parse(text) {
        const value = super.parse(text)
        const min = this.props.min ?? -Infinity
        const max = this.props.max ?? Infinity
        return clamp(Number(value), min, max)
    }
}


export class ColorType extends TextType {
    static type = 'color'

    parse(text) {
        const hex = super.parse(text)
        return Color.fromHex(hex)
    }
}


export class PointType extends BaseType {
    static type = 'point'

    parse(hash) {
        return Point.fromHash(hash)
    }
}


export class BooleanType extends BaseType {
    static type = 'boolean'

    parse(value) {
        return value === 'true'
    }
}


export class EnumType extends BaseType {
    static type = 'enum'

    parse(value) {
        return value ?? this.defaultValue
    }
}


export class Type {
    static text = BaseType.define(TextType)
    static number = BaseType.define(NumberType)
    static boolean = BaseType.define(BooleanType)
    static color = BaseType.define(ColorType)
    static point = BaseType.define(PointType)
    static enum = BaseType.define(EnumType)
}
