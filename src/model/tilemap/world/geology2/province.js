export class ProvinceModel {
    #realmTileMap
    #provinces

    constructor(realmTileMap) {
        this.#realmTileMap = realmTileMap
        this.#provinces = []
    }

    get size() {
        return this.#provinces.length
    }

    get(point) {
        return this.#realmTileMap.getRegion(point)
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
