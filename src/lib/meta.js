import { Color } from '/lib/color'


// let's create our own type system
class Type {
    constructor(type, label, value, props) {
        this.type = type
        this.label = label ?? type
        this.name = normalizeLabel(label)
        this.value = value
        this.props = props
        this.description = props.description ?? `A ${type}.`
    }
}


export class NumberType extends Type {
    constructor(label, value, props) {
        super('number', label, value, props)
    }

    sanitize(value) {
        return Number(value)
    }
}


export class TextType extends Type {
    constructor(label, value, props) {
        super('text', label, value, props)
    }

    sanitize(value) {
        return String(value).trim()
    }
}


export class SeedType extends Type {
    constructor(label, value, props) {
        super('text', label, value, props)
    }

    sanitize(value) {
        const seed = String(value).trim()
        return seed.length ? seed : String(Number(new Date()))
    }
}


export class ColorType extends Type {
    constructor(label, value, props) {
        super('color', label, value, props)
    }

    sanitize(value) {
        return Color.fromHex(value)
    }
}


export class BooleanType extends Type {
    constructor(label, value, props) {
        super('boolean', label, value, props)
    }

    sanitize(value) {
        return Boolean(value)
    }
}


export class Schema {
    static boolean = buildType(BooleanType)
    static text = buildType(TextType)
    static number = buildType(NumberType)
    static color = buildType(ColorType)
    static seed = buildType(SeedType)
}


export class Meta {
    constructor(name, ...schema) {
        this.name = name
        this.schema = schema
    }

    get defaultConfig() {
        return Object.fromEntries(this.schema.map(
            type => [type.name, type.value]
        ))
    }

    get nameMap() {
        return Object.fromEntries(this.schema.map(
            type => [type.name, type]
        ))
    }

    parse(raw_data) {
        const data = raw_data ?? this.defaultConfig
        const map = {}
        for(let [name, value] of Object.entries(data)) {
            map[name] = this.nameMap[name].sanitize(value)
        }
        return map
    }
}


function normalizeLabel(label) {
    const capitalWords = label.split(' ').map((word, index) => {
        const lowerCase = word.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
        if (index > 0)
            return lowerCase[0].toUpperCase() + lowerCase.substring(1)
        return lowerCase
    })
    return capitalWords.join('')
}


function buildType(_Type) {
    return (label, value, props={}) => new _Type(label, value, props)
}