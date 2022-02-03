const TYPE_LAND = 0
const TYPE_OCEAN = 1


export class ContinentModel {
    #regionTileMap
    #typeMap
    #continents
    #borders

    constructor(regionTileMap) {
        this.#regionTileMap = regionTileMap
        this.#continents = this._buildContinents(regionTileMap)
        this.#borders = regionTileMap.getBorders()
        this.#typeMap = this._buildTypeMap(this.#continents)
    }

    _buildContinents(regionTileMap) {
        // sort by bigger to smaller continents
        const cmpDescendingArea = (id0, id1) => {
            const area0 = regionTileMap.getRegionAreaById(id0)
            const area1 = regionTileMap.getRegionAreaById(id1)
            return area1 - area0
        }
        return regionTileMap.getRegions().sort(cmpDescendingArea)
    }

    // TODO: move this step further
    _buildTypeMap(continents) {
        let totalOceanicArea = 0
        const halfArea = Math.floor(this.#regionTileMap.area / 2)
        const types = new Map()
        for (let continent of continents) {
            totalOceanicArea += this.getArea(continent)
            const isOceanic = totalOceanicArea < halfArea
            types.set(continent, isOceanic ? TYPE_OCEAN : TYPE_LAND)
        }
        return types
    }

    get size() {
        return this.#continents.length
    }

    getContinent(point) {
        return this.#regionTileMap.getRegion(point)
    }

    getPlates() {
        return this.#continents
    }

    getBorders() {
        return this.#borders
    }

    getSidePlates(plateId) {
        return this.#regionTileMap.getSideRegions(plateId)
    }

    getArea(plateId) {
        return this.#regionTileMap.getRegionAreaById(plateId)
    }

    isOceanic(plateId) {
        return this.#typeMap.get(plateId) === TYPE_OCEAN
    }

    isContinental(plateId) {
        return this.#typeMap.get(plateId) === TYPE_LAND
    }

    isSameType(plate0, plate1) {
        return this.#typeMap.get(plate0) === this.#typeMap.get(plate1)
    }

    forEach(callback) {
        this.#continents.forEach(callback)
    }

    map(callback) {
        this.#continents.map(callback)
    }
}
