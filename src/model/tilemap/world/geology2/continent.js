import { Point } from '/lib/point'


const TYPE_LAND = 0
const TYPE_OCEAN = 1


export class ContinentModel {
    #realmTileMap
    #typeMap
    #continents
    #borders

    constructor(realmTileMap) {
        this.#realmTileMap = realmTileMap
        this.#continents = this._buildContinents()
        // this.#borders = realmTileMap.getBorders()
        this.#typeMap = this._buildTypeMap(this.#continents)
    }

    _buildContinents() {
        // sort by bigger to smaller continents
        const cmpDescendingArea = (id0, id1) => {
            const area0 = this.#realmTileMap.getArea(id0)
            const area1 = this.#realmTileMap.getArea(id1)
            return area1 - area0
        }
        return this.#realmTileMap.getRealms().sort(cmpDescendingArea)
    }

    _buildTypeMap(continents) {
        let totalOceanicArea = 0
        const halfArea = Math.floor(this.#realmTileMap.area / 2)
        const types = new Map()
        for (let continent of continents) {
            totalOceanicArea += this.#realmTileMap.getArea(continent)
            const isOceanic = totalOceanicArea < halfArea
            types.set(continent, isOceanic ? TYPE_OCEAN : TYPE_LAND)
        }
        return types
    }

    get size() {
        return this.#continents.length
    }

    get ids() {
        return this.#continents
    }

    get(point) {
        return this.#realmTileMap.getRealm(point)
    }

    getArea(continent) {
        return this.#realmTileMap.getArea(continent)
    }

    getContinents() {
        return this.#realmTileMap.getRealms()
    }

    isOceanic(continent) {
        return this.#typeMap.get(continent) === TYPE_OCEAN
    }

    getOrigin(point) {
        return this.#realmTileMap.getRealmOrigin(point)
    }

    isBorder(point) {
        return this.#realmTileMap.isRealmBorder(point)
    }

    isOrigin(point) {
        const origin = this.getOrigin(point)
        return Point.equals(origin, point)
    }

    forEach(callback) {
        this.#continents.forEach(callback)
    }

    map(callback) {
        this.#continents.map(callback)
    }
}
