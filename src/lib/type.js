import { Color } from '/lib/color'


// let's create our own type system, it's fun
class TypeClass {
    static instance(TypeClass) {
        return (label, value, props={}) => new TypeClass(label, value, props)
    }

    constructor(type, label, value, props) {
        this.type = type
        this.label = label ?? type
        this.name = normalizeLabel(label)
        this.value = value
        this.props = props
        this.description = props.description ?? `A ${type}.`
    }
}


export class NumberType extends TypeClass {
    constructor(label, value, props) {
        super('number', label, value, props)
    }

    sanitize(value) {
        return Number(value)
    }
}


export class TextType extends TypeClass {
    constructor(label, value, props) {
        super('text', label, value, props)
    }

    sanitize(value) {
        return String(value).trim()
    }
}


export class SeedType extends TypeClass {
    constructor(label, value, props) {
        super('text', label, value, props)
    }

    sanitize(value) {
        const seed = String(value).trim()
        return seed.length ? seed : String(Number(new Date()))
    }
}


export class ColorType extends TypeClass {
    constructor(label, value, props) {
        super('color', label, value, props)
    }

    sanitize(value) {
        return Color.fromHex(value)
    }
}


export class BooleanType extends TypeClass {
    constructor(label, value, props) {
        super('boolean', label, value, props)
    }

    sanitize(value) {
        return Boolean(value)
    }
}


export class Schema {
    static boolean = TypeClass.instance(BooleanType)
    static text = TypeClass.instance(TextType)
    static number = TypeClass.instance(NumberType)
    static color = TypeClass.instance(ColorType)
    static seed = TypeClass.instance(SeedType)
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
