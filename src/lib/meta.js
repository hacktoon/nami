
export class MetaClass {
    constructor(...types) {
        this.types = types
    }

    parseConfig(raw_data) {
        const data = Object.assign(this.defaultConfig, raw_data)
        const types = Object.entries(data)
        const map = {}

        for(let [name, value] of types) {
            map[name] = this.nameMap[name].sanitize(value)
        }

        return map
    }

    get defaultConfig() {
        const entries = this.types.map(type => [type.name, type.value])
        return Object.fromEntries(entries)
    }

    get nameMap() {
        const entries = this.types.map(type => [type.name, type])
        return Object.fromEntries(entries)
    }
}
