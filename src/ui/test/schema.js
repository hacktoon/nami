import { Random } from '/lib/random'
import { Point } from '/lib/point'
import { clamp } from '/lib/number'



export class Schema {
    constructor(...types) {
        this.types = types
    }

    defaults() {
        const mapToDefault = type => [type.name, type.defaultValue]
        const entries = this.types.map(mapToDefault)
        return new Map(entries)
    }

    parse(raw_data) {
        const defaults = this.defaults()
        const types = Object.entries(defaults)
        const map = new Map()
        for(let [name, value] of types) {
            const field = this.nameMap[name]
            map.set(name, field.sanitize(value))
        }
        return map
    }

    get nameMap() {
        const entries = this.types.map(type => [type.name, type])
        return Object.fromEntries(entries)
    }
}


// let's create our own type system, it's fun
class AbstractType {
    static define(TypeClass) {
        // Example: Type.number('foobar', 'Foobar param', 42)
        return (name, label, defaultValue, props={}) => {
            const type = TypeClass.type
            return new TypeClass(type, name, label, defaultValue, props)
        }
    }

    constructor(type, name, label, defaultValue, fieldAttrs) {
        this.type = type
        this.name = name
        this.label = label
        this.defaultValue = defaultValue
        this.fieldAttrs = fieldAttrs
    }

    sanitize(value) {
        return value
    }
}


export class NumberType extends AbstractType {
    static type = 'number'

    sanitize(value=0) {
        const number = value ?? 0
        const min = this.fieldAttrs.min ?? -Infinity
        const max = this.fieldAttrs.max ?? Infinity
        return clamp(Number(number), min, max)
    }
}


export class TextType extends AbstractType {
    static type = 'text'

    sanitize(value) {
        return String(value).trim()
    }
}


export class SeedType extends TextType {
    static type = 'seed'

    sanitize(value) {
        const text = super.sanitize(value)
        const seed = text.length ? text : String(Number(new Date()))
        Random.seed = seed
        return seed
    }
}


export class ColorType extends AbstractType {
    static type = 'color'
}


export class PointType extends AbstractType {
    static type = 'point'

    sanitize({x, y}) {
        return new Point(Number(x), Number(y))
    }
}


export class BooleanType extends AbstractType {
    static type = 'boolean'

    sanitize(value) {
        return Boolean(value)
    }
}


export class Type {
    static point = AbstractType.define(PointType)
    static boolean = AbstractType.define(BooleanType)
    static text = AbstractType.define(TextType)
    static number = AbstractType.define(NumberType)
    static color = AbstractType.define(ColorType)
    static seed = AbstractType.define(SeedType)
}
