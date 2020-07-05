


// let's create our own type system
class Type {
    constructor(type, {label, description, value, ...props}) {
        this.type = type
        this.label = label ?? type
        this.description = description ?? `A ${type}.`
        this.name = normalizeLabel(label)
        this.value = value
        this.props = props
    }

    sanitize(value) {
        return String(value).trim()
    }
}


export class NumberType extends Type {
    constructor(...props) {
        super('number', ...props)
    }

    sanitize(value) {
        return Number(value)
    }
}


export class TextType extends Type {
    constructor(...props) {
        super('text', ...props)
    }
}


export class SeedType extends Type {
    constructor(...props) {
        super('text', ...props)
    }

    sanitize(value) {
        return value.length ? value : String(new Date())
    }
}


export class ColorType extends Type {
    constructor(...props) {
        super('text', ...props)
    }

    sanitize(value) {
        return value
    }
}


export class BooleanType extends Type {
    constructor(...props) {
        super('text', ...props)
    }

    sanitize(value) {
        return Boolean(value)
    }
}


export class Schema {
    static boolean = props => new BooleanType(props)
    static text = props => new TextType(props)
    static number = props => new NumberType(props)
    static color = props => new ColorType(props)
    static seed = props => new SeedType(props)

    constructor(types) {
        this.types = types
        this.defaultConfig = Object.fromEntries(types.map(
            ({name, value}) => [name, value]
        ))
    }

    createConfig(data) {
        return data
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