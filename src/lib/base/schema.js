
export class Schema {
    constructor(...types) {
        this.types = types
    }

    parse(rawMap=new Map()) {
        const schemaInstance = new SchemaInstance(this)
        for(let type of this.types) {
            const name = type.name
            let value = type.defaultValue
            if (rawMap.has(name)) {
                const rawValue = rawMap.get(name)
                value = type.parse(rawValue)
            }
            schemaInstance.set(name, value)
        }
        return schemaInstance
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

    has(name) {
        return this.values.has(name)
    }

    get(name) {
        return this.values.get(name)
    }

    entries() {
        return this.values.entries()
    }
}