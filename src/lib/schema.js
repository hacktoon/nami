import { Color } from '/lib/color'


// let's create our own type system
class Type {
    constructor(type, label, value, ...props) {
        this.type = type
        this.label = label ?? type
        this.name = normalizeLabel(label)
        this.value = value
        this.props = props
        this.description = props.description ?? `A ${type}.`
    }

    sanitize(value) {
        return String(value).trim()
    }
}


export class NumberType extends Type {
    constructor(label, value, ...props) {
        super('number', label, value, ...props)
    }

    sanitize(value) {
        return Number(value)
    }
}


export class TextType extends Type {
    constructor(label, value, ...props) {
        super('text', label, value, ...props)
    }
}


export class SeedType extends Type {
    constructor(label, value, ...props) {
        super('text', label, value, ...props)
    }

    sanitize(value) {
        return value.length ? value : String(new Date())
    }
}


export class ColorType extends Type {
    constructor(label, value, ...props) {
        super('color', label, value, ...props)
    }

    sanitize(value) {
        return Color.fromHex(value)
    }

    value(color) {
        return color.toHex()
    }
}


export class BooleanType extends Type {
    constructor(label, value, ...props) {
        super('boolean', label, value, ...props)
    }

    sanitize(value) {
        return Boolean(value)
    }
}


export class Schema {
    static boolean = (...props) => new BooleanType(...props)
    static text = (...props) => new TextType(...props)
    static number = (...props) => new NumberType(...props)
    static color = (...props) => new ColorType(...props)
    static seed = (...props) => new SeedType(...props)

    constructor(...types) {
        console.log('build schema', types);
        this.types = types.map(type => ({...type, value: type.sanitize(type.value)}))
        this.defaultConfig = Object.fromEntries(types.map(
            type => [type.name, type.sanitize(type.value)]
        ))
    }

    createConfig(data) {
        // console.log('data', data, '\n', this.types);

        return Object.fromEntries(this.types.map( // TODO: types has no sanitize
            type => [type.name, this.types[type.name].sanitize(data[type.name])]
        ))
    }
}


function normalizeLabel(label) {
    const capitalWords = label.split(' ').map((word, index) => {
        const lowerCase = word.toLowerCase()
        if (index > 0)
            return lowerCase[0].toUpperCase() + lowerCase.substring(1)
        return lowerCase
    })
    return capitalWords.join('')
}