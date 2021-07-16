
export class Schema {
    constructor(name, ...types) {
        this.name = name
        this.types = types
    }

    build(rawValueMap=new Map()) {
        console.log(rawValueMap);
        const valueMap = new Map()
        const typeMap = new Map()
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
            typeMap.set(name, type)
        }
        const instance = new SchemaInstance(this, valueMap, typeMap)
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
        return new SchemaInstance(this, valueMap, this.typeMap)
    }
}


class SchemaInstance {
    constructor(schema, valueMap, typeMap) {
        this.name = schema.name
        this.valueMap = valueMap
        this.typeMap = typeMap
    }

    get size() {
        return this.valueMap.size
    }

    get types() {
        return [...this.typeMap.values()]
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
        return new SchemaInstance(this, valueMap, this.typeMap)
    }

    clone() {
        return new SchemaInstance(this, this.valueMap, this.typeMap)
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
        return new SchemaInstance(this, valueMap, this.typeMap)
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
