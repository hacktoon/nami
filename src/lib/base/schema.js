
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

    unparse(schemaInstance) {
        const map = new Map()
        for(let type of schemaInstance.types) {
            const name = type.name
            const value = schemaInstance.get(name)
            map.set(name, type.unparse(value))
        }
        return map
    }
}


class SchemaInstance {
    constructor(schema, map) {
        this.schema = schema
        this.valueMap = map
    }

    get size() {
        return this.valueMap.size
    }

    get types() {
        return this.schema.types
    }

    get(...names) {
        if (names.length == 1)
            return this.valueMap.get(names[0])
        const data = []
        for (let i=0; i<names.length; i++) {
            data.push(this.valueMap.get(names[i]))
        }
        return data
    }

    has(name) {
        return this.valueMap.has(name)
    }

    update(name, value) {
        const valueMap = new Map(this.valueMap.entries())
        valueMap.set(name, value)
        return new SchemaInstance(this.schema, valueMap)
    }

    entries() {
        return this.valueMap.entries()
    }
}