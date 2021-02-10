import { Point } from '/lib/point'
import { Color } from '/lib/color'
import { clamp } from '/lib/number'



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

    defaultValues() {
        const mapToDefault = type => [type.name, type.attributes.default]
        const entries = this.types.map(mapToDefault)
        return new Map(entries)
    }

    parse(formMap) {
        const map = new Map()
        for(let type of this.types) {
            const rawValue = formMap.get(type.name)
            const value = type.parse(rawValue)
            map.set(type.name, value)
        }
        return map
    }
}


// let's create our own type system, it's fun
class BaseType {
    static define(TypeClass) {
        // Example: Type.number('foobar', 'Foobar param', 42)
        return (name, label, props={}) => {
            const type = TypeClass.type
            return new TypeClass(type, name, label, props)
        }
    }

    constructor(type, name, label, attributes) {
        this.type = type
        this.name = name
        this.label = label
        this.attributes = attributes
    }

    parse(value) {
        return value
    }
}




export class TextType extends BaseType {
    static type = 'text'

    parse(value) {
        return String(value ?? '')
    }
}


export class NumberType extends TextType {
    static type = 'number'

    parse(text) {
        const value = super.parse(text)
        const min = this.attributes.min ?? -Infinity
        const max = this.attributes.max ?? Infinity
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
}


export class Type {
    static text = BaseType.define(TextType)
    static number = BaseType.define(NumberType)
    static boolean = BaseType.define(BooleanType)
    static color = BaseType.define(ColorType)
    static point = BaseType.define(PointType)
    static enum = BaseType.define(EnumType)
}
