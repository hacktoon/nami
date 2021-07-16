
export class Schema {
    constructor(name, ...types) {
        this.name = name
        this.types = types
    }

    parse(rawMap=new Map()) {
        const valueMap = new Map()
        const typeMap = new Map()
        for(let type of this.types) {
            const name = type.name
            let value = type.defaultValue
            if (rawMap.has(name)) {
                const rawValue = rawMap.get(name)
                value = type.parse(rawValue)
            }
            valueMap.set(name, value)
            typeMap.set(name, type)
        }
        return new SchemaInstance(this.name, valueMap, typeMap)
    }
}


class SchemaInstance {
    constructor(name, valueMap, typeMap) {
        this.name = name
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
        return new SchemaInstance(this.name, valueMap, this.typeMap)
    }

    clone() {
        return new SchemaInstance(this.name, this.valueMap, this.typeMap)
    }
}