import { Point } from '/lib/base/point'
import { Color } from '/lib/base/color'
import { clamp } from '/lib/base/number'


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

    unparse(value) {
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
        const value = Number(text) ?? 0
        const min = this.props.min ?? -Infinity
        const max = this.props.max ?? Infinity
        return clamp(value, min, max)
    }
}


class ColorType extends TextType {
    static type = 'color'

    parse(hex) {
        return Color.fromHex(hex)
    }

    unparse(color) {
        return color.toHex()
    }
}


class PointType extends BaseType {
    static type = 'point'

    parse(hash) {
        console.log(hash);
        return Point.fromHash(hash)
    }

    unparse(point) {
        return point.hash
    }
}


class BooleanType extends BaseType {
    static type = 'boolean'

    parse(text) {
        return String(text) === 'true'
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
}
