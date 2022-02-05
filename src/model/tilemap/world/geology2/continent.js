import { Point } from '/lib/point'
import { Random } from '/lib/random'
import { PairMap } from '/lib/map'


const TYPE_LAND = 0
const TYPE_OCEAN = 1


export class ContinentModel {
    #realmTileMap
    #typeMap
    #continents
    #borderMap

    constructor(realmTileMap) {
        this.#realmTileMap = realmTileMap
        this.#continents = this._buildContinents()
        this.#typeMap = this._buildTypeMap(this.#continents)
        this.#borderMap = this._buildBorderMap(realmTileMap)
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

    _buildBorderMap(realmTileMap) {
        const borderMap = new PairMap()
        for(let continent of realmTileMap.getRealms()) {
            for(let sideContinent of realmTileMap.getSideRealms(continent)) {
                const border = Random.chance(.5) ? TYPE_OCEAN : TYPE_LAND
                borderMap.set(continent, sideContinent, border)
            }
        }
        return borderMap
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

    isLandBorder(continent, sideContinent) {
        return this.#borderMap.get(continent, sideContinent) === TYPE_LAND
    }

    isOceanicBorder(continent, sideContinent) {
        return this.#borderMap.get(continent, sideContinent) === TYPE_OCEAN
    }

    forEach(callback) {
        this.#continents.forEach(callback)
    }

    map(callback) {
        return this.#continents.map(callback)
    }
}
