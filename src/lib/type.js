import { Point } from './point'
import { Color } from './color'
import { Rect, clamp } from './number'


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
        return value ?? this.defaultValue
    }

    toString(value) {
        return String(value)
    }
}


class TextType extends BaseType {
    static type = 'text'

    parse(value) {
        return String(value ?? this.defaultValue)
    }
}


class NumberType extends BaseType {
    static type = 'number'

    parse(text) {
        const value = Number(text ?? this.defaultValue)
        const min = this.props.min ?? -Infinity
        const max = this.props.max ?? Infinity
        return clamp(value, min, max)
    }
}


class ColorType extends TextType {
    static type = 'color'

    parse(hex) {
        return Color.fromHex(hex ?? this.defaultValue)
    }

    toString(color) {
        return color.toHex()
    }
}


class PointType extends BaseType {
    static type = 'point'

    parse(hash) {
        return Point.fromHash(hash ?? this.defaultValue)
    }

    toString(point) {
        return Point.hash(point)
    }
}


class RectType extends BaseType {
    static type = 'rect'

    parse(hash) {
        return Rect.fromHash(hash ?? '150x100')
    }

    toString(hash) {
        return hash.hash()
    }
}


class BooleanType extends BaseType {
    static type = 'boolean'

    parse(text) {
        const value = String(text)
        if (value === 'true') return true
        if (value === 'false') return false
        return this.defaultValue
    }
}


class EnumType extends BaseType {
    static type = 'selection'

    parse(text) {
        return text ?? this.defaultValue
    }
}


export class Type {
    static text = BaseType.define(TextType)
    static number = BaseType.define(NumberType)
    static boolean = BaseType.define(BooleanType)
    static color = BaseType.define(ColorType)
    static point = BaseType.define(PointType)
    static selection = BaseType.define(EnumType)
    static rect = BaseType.define(RectType)
}
