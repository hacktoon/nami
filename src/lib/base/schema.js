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

    parseForm(inputs) {
        const entries = Array.from(inputs)
            // check if input was defined in schema
            .filter(input => this.has(input.name))
            .map(input => [input.name, input.value])
        return new Map(entries)
    }

    parse(rawData=new Map()) {
        const map = new Map()
        // const instance = new SchemaInstance(this)
        for(let type of this.types) {
            const name = type.name
            let value = type.defaultValue
            if (rawData.has(name)) {
                const rawValue = rawData.get(name)
                value = type.parse(rawValue)
            }
            map.set(name, value)
        }
        return map
    }
}


class SchemaInstance {
    constructor(schema) {
        this.schema = schema
        this.values = new Map()
        this.types = schema.types
    }

    get size() {
        return this.values.size
    }

    set(name, value) {
        return this.values.set(name, value)
    }

    get(name) {
        return this.values.get(name)
    }

    entries() {
        return this.values.entries()
    }
}