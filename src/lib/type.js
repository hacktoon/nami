import { Point } from '/src/lib/geometry/point'
import { Color } from '/src/lib/color'
import { Rect } from '/src/lib/geometry/rect'
import { clamp } from '/src/lib/function'


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
        const rect = Rect.fromHash(hash ?? '100x100')
        const min = Rect.fromHash(this.props.min ?? '10x10')
        const max = Rect.fromHash(this.props.max ?? '200x200')
        const width = clamp(rect.width, min.width, max.width)
        const height = clamp(rect.height, min.height, max.height)
        return new Rect(width, height)
    }

    toString(hash) {
        return hash.hash()
    }
}

class BooleanType extends BaseType {
    static type = 'boolean'

    parse(text) {
        const value = String(text) ?? 'false'
        if (value === 'true') return true
        if (value === 'false') return false
        return this.defaultValue
    }
}


class SelectionType extends BaseType {
    static type = 'selection'

    parse(value) {
        for (let option of this.props.options) {
            if (option.value === value) return value
        }
        return this.defaultValue
    }
}


export class Type {
    static text = BaseType.define(TextType)
    static number = BaseType.define(NumberType)
    static boolean = BaseType.define(BooleanType)
    static color = BaseType.define(ColorType)
    static point = BaseType.define(PointType)
    static selection = BaseType.define(SelectionType)
    static rect = BaseType.define(RectType)
}
