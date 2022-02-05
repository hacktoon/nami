export class ProvinceModel {
    #realmTileMap
    #provinces
    #cornerMap = new Map()

    constructor(realmTileMap) {
        this.#realmTileMap = realmTileMap
        this.#provinces = realmTileMap.getRegions()
        this.#provinces.forEach(province => {

        })
    }

    get size() {
        return this.#provinces.length
    }

    get(point) {
        return this.#realmTileMap.getRegion(point)
    }

    isCorner(province) {
        return this.#realmTileMap.isCornerRegion(province)
    }

    isBorder(point) {
        return this.#realmTileMap.isRegionBorder(point)
    }

    forEach(callback) {
        this.#provinces.forEach(callback)
    }

    map(callback) {
        return this.#provinces.map(callback)
    }
}
