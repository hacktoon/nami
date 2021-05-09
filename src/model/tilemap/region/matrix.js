
export class RegionMatrix {
    constructor(data) {
        this._matrix = data.regionMatrix
        this._redirects = data.redirects
    }

    get(point) {
        let id = this._matrix.get(point)
        return this._redirects.has(id) ? this._redirects.get(id) : id
    }
}


export class BorderMatrix {
    constructor(data) {
        this._borderMatrix = data.borderMatrix
        this._regionMatrix = data.regionMatrix
        this._redirects = data.redirects
    }

    get(point) {
        const redirectedIds = new Set()
        const regionId = this._regionMatrix.get(point)
        const borderIds = this._borderMatrix.get(point)
        const redirRegionId = this._redirect(regionId)
        for(let id of borderIds) {
            const redirId = this._redirect(id)
            if (redirRegionId !== redirId)
                redirectedIds.add(redirId)
        }
        return redirectedIds
    }

    _redirect(id) {
        return this._redirects.has(id) ? this._redirects.get(id) : id
    }
}
