
export class MetaClass {
    constructor(...types) {
        this.types = types
    }

    parseConfig(raw_data) {
        const data = this.#defaultConfig(raw_data)
        const types = Object.entries(data)
        const config = new Config()
        for(let [name, value] of types) {
            const field = this.nameMap[name]
            config.set(name, field.sanitize(value))
        }
        return config
    }

    #defaultConfig(raw_data) {
        const entries = this.types.map(type => [type.name, type.value])
        return Object.assign(Object.fromEntries(entries), raw_data)
    }

    get nameMap() {
        const entries = this.types.map(type => [type.name, type])
        return Object.fromEntries(entries)
    }
}


export class Config {
    constructor() {
        this.map = new Map()
    }

    set(name, value) {
        this.map.set(name, value)
    }

    get(name) {
        return this.map.get(name)
    }

    original() {
        const entries = Array.from(this.map.entries())
        return Object.fromEntries(entries.map(([key, value]) => {
            return [key, value]
        }))
    }
}
