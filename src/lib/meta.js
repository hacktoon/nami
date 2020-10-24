
export class MetaClass {
    constructor(...schema) {
        this.schema = schema
    }

    get defaultConfig() {
        const entries = this.schema.map(type => [type.name, type.defaultValue])
        return Object.fromEntries(entries)
    }

    get nameMap() {
        const entries = this.schema.map(type => [type.name, type])
        return Object.fromEntries(entries)
    }

    parseConfig(raw_data) {
        const data = Object.assign(this.defaultConfig, raw_data)
        const types = Object.entries(data)
        const map = {}

        for(let [name, defaultValue] of types) {
            map[name] = this.nameMap[name].sanitize(defaultValue)
        }

        return map
    }
}
