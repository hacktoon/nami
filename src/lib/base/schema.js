
export class Schema {
    constructor(name, ...types) {
        this.name = name
        this.types = types
        this.typeMap = new Map(types.map(type => [type.name, type]))
    }

    build(rawValueMap=new Map()) {
        const valueMap = new Map()
        // const cache = STORAGE.getItem(this.name)
        // if (cache !== null) return this.fromString(cache)
        for(let type of this.types) {
            const name = type.name
            let value = type.defaultValue
            if (rawValueMap.has(name)) {
                const rawValue = rawValueMap.get(name)
                value = type.parse(rawValue)
            }
            valueMap.set(name, value)
        }
        const instance = new SchemaInstance(this, valueMap)
        // STORAGE.setItem(instance.name, instance.toString())
        return instance
    }

    parseString(text) {
        const data = parseJSON(text)
        const valueMap = new Map(data.map(entry => {
            const [name, rawValue] = entry
            const type = this.typeMap.get(name)
            const value = type.parse(rawValue)
            return [name, value]
        }))
        return new SchemaInstance(this, valueMap)
    }
}


class SchemaInstance {
    constructor(schema, valueMap) {
        this.schema = schema
        this.name = schema.name
        this.typeMap = schema.typeMap
        this.valueMap = valueMap
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
        for(let name of names) {
            data.push(this.valueMap.get(name))
        }
        return data
    }

    update(name, rawValue) {
        const type = this.typeMap.get(name)
        const value = type.parse(rawValue)
        const valueMap = new Map([...this.valueMap, [name, value]])
        return new SchemaInstance(this.schema, valueMap)
    }

    clone() {
        return new SchemaInstance(this.schema, this.valueMap)
    }

    toString() {
        return JSON.stringify([...this.valueMap].map(entry => {
            const [name, value] = entry
            const type = this.typeMap.get(name)
            return [name, type.unparse(value)]
        }))
    }

    fromString(text) {
        const data = parseJSON(text)
        const valueMap = new Map(data.map(entry => {
            const [name, rawValue] = entry
            const type = this.typeMap.get(name)
            const value = type.parse(rawValue)
            return [name, value]
        }))
        return new SchemaInstance(this.schema, valueMap)
    }
}


function parseJSON(text) {
    try {
        return JSON.parse(String(text)) ?? []
    } catch (e) {
        console.error(e)
        return []
    }
}
