
export class Schema {
    constructor(...types) {
        this.types = types
    }

    parse(rawMap=new Map()) {
        const map = new Map()
        for(let type of this.types) {
            const name = type.name
            let value = type.defaultValue
            if (rawMap.has(name)) {
                const rawValue = rawMap.get(name)
                value = type.parse(rawValue)
            }
            map.set(name, value)
        }
        return new SchemaInstance(this, map)
    }
}


class SchemaInstance {
    constructor(schema, map) {
        this.schema = schema
        this.valueMap = map
        this.types = schema.types
    }

    get size() {
        return this.valueMap.size
    }

    update(name, value) {
        const valueMap = new Map(this.valueMap.entries())
        valueMap.set(name, value)
        return new SchemaInstance(this.schema, valueMap)
    }

    has(name) {
        return this.valueMap.has(name)
    }

    get(name) {
        return this.valueMap.get(name)
    }

    entries() {
        return this.valueMap.entries()
    }
}