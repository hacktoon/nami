import { Color } from '/lib/color'


// let's create our own type system, it's fun
class AbstractType {
    static create(AbstractType) {
        return (label, defaultValue, props={}) => {
            return new AbstractType(label, defaultValue, props)
        }
    }

    constructor(type, label, defaultValue, props) {
        this.type = type
        this.label = label
        this.name = normalizeLabel(label)
        this.defaultValue = defaultValue
        this.props = props
        this.description = props.description ?? `${type}(${label})`
    }
}


export class NumberType extends AbstractType {
    static type = 'number'

    constructor(label, value, props) {
        super(NumberType.type, label, value, props)
    }

    sanitize(value) {
        return Number(value)
    }
}


export class TextType extends AbstractType {
    static type = 'text'

    constructor(label, value, props) {
        super(TextType.type, label, value, props)
    }

    sanitize(value) {
        return String(value).trim()
    }
}


export class SeedType extends AbstractType {
    static type = 'text'

    constructor(label, value, props) {
        super(SeedType.type, label, value, props)
    }

    sanitize(value) {
        const seed = String(value).trim()
        return seed.length ? seed : String(Number(new Date()))
    }
}


export class ColorType extends AbstractType {
    static type = 'color'

    constructor(label, value, props) {
        super(ColorType.type, label, value, props)
    }

    sanitize(value) {
        return Color.fromHex(value)
    }
}


export class BooleanType extends AbstractType {
    static type = 'boolean'

    constructor(label, value, props) {
        super(BooleanType.type, label, value, props)
    }

    sanitize(value) {
        return Boolean(value)
    }
}


export class Type {
    static boolean = AbstractType.create(BooleanType)
    static text = AbstractType.create(TextType)
    static number = AbstractType.create(NumberType)
    static color = AbstractType.create(ColorType)
    static seed = AbstractType.create(SeedType)
}


function normalizeLabel(label) {
    const capitalWords = label.split(' ').map((word, index) => {
        const lowerCase = removeSymbols(word.toLowerCase())
        if (index > 0)
            return lowerCase[0].toUpperCase() + lowerCase.substring(1)
        return lowerCase
    })
    return capitalWords.join('')
}


function removeSymbols(text) {
    return text.replace(/[^a-zA-Z0-9]/g, '')
}
