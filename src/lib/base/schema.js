
const Storage = window.localStorage


export class Schema {
    constructor(name, ...types) {
        this.name = name
        this.types = types
        this.typeMap = new Map(types.map(type => [type.name, type]))
    }

    buildFrom(rawValueMap) {
        const valueMap = new Map()
        for(let type of this.types) {
            const name = type.name
            let value = type.defaultValue
            if (rawValueMap.has(name)) {
                const rawValue = rawValueMap.get(name)
                value = type.parse(rawValue)
            }
            valueMap.set(name, value)
        }
        return new SchemaInstance(this, valueMap)
    }

    build() {
        const valueMap = new Map()
        const cacheValueMap = this._getCache(this.name)
        for(let typedef of this.types) {
            const name = typedef.name
            const rawValue = cacheValueMap.get(name)
            valueMap.set(name, typedef.parse(rawValue))
        }
        const instance = new SchemaInstance(this, valueMap)
        console.log(valueMap);
        // Storage.setItem(instance.name, instance.toString())
        return instance
    }

    _getCache(name) {
        const stringEntries = Storage.getItem(name)
        const entries = parseJSON(stringEntries)
        return new Map(entries.map(entry => {
            const [name, rawValue] = entry
            const typedef = this.typeMap.get(name)
            const value = typedef.parse(rawValue)
            return [name, value]
        }))
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
}
