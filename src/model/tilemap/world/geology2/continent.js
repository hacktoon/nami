import { Point } from '/lib/point'


const TYPE_LAND = 0
const TYPE_OCEAN = 1


export class ContinentModel {
    #realmTileMap
    #continents = []
    #typeMap = new Map()

    #buildContinents(realmTileMap) {
        let totalOceanicArea = 0
        const halfArea = Math.floor(realmTileMap.area / 2)
        // sort by bigger to smaller continents
        const cmpDescendingArea = (id0, id1) => {
            const area0 = realmTileMap.getArea(id0)
            const area1 = realmTileMap.getArea(id1)
            return area1 - area0
        }
        const continents = this.#realmTileMap.getRealms().sort(cmpDescendingArea)
        for (let continent of continents) {
            totalOceanicArea += realmTileMap.getArea(continent)
            const isOceanic = totalOceanicArea < halfArea
            this.#typeMap.set(continent, isOceanic ? TYPE_OCEAN : TYPE_LAND)
            this.#continents.push(continent)
        }
    }

    constructor(realmTileMap) {
        this.#realmTileMap = realmTileMap
        this.#buildContinents(realmTileMap)
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
        return this.#continents.map(callback)
    }
}
