
export class MetaClass {
    constructor(...types) {
        this.types = types
    }

    parseConfig(raw_data) {
        const data = this.#defaultConfig(raw_data)
        const types = Object.entries(data)
        const map = {}

        for(let [name, value] of types) {
            map[name] = this.nameMap[name].sanitize(value)
        }

        return map
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
