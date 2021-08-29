
export class PairMap {
    constructor() {
        this._sources = new Map()
    }

    set(source, target, value) {
        if (! this._sources.has(source)) {
            this._sources.set(source, new Map())
        }
        const targets = this._sources.get(source)
        if (! targets.has(target)) {
            targets.set(target, value)
        }
    }

    has(source, target) {
        if (! this._sources.has(source)) return false
        return this._sources.get(source).has(target)
    }

    get(source, target) {
        return this._sources.get(source).get(target)
    }
}
