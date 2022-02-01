import { Direction } from '/lib/direction'


const TYPE_CONTINENTAL = 'L'
const TYPE_OCEANIC = 'W'


export class PlateModel {
    #regionTileMap
    #typeMap
    #plates

    constructor(regionTileMap) {
        this.#regionTileMap = regionTileMap
        this.#plates = this._buildPlates(regionTileMap)
        this.#typeMap = this._buildTypeMap(this.#plates)
    }

    _buildPlates(regionTileMap) {
        // sort by bigger to smaller plates
        const cmpDescendingArea = (id0, id1) => {
            const area0 = regionTileMap.getRegionAreaById(id0)
            const area1 = regionTileMap.getRegionAreaById(id1)
            return area1 - area0
        }
        return regionTileMap.getRegions().sort(cmpDescendingArea)
    }

    _buildTypeMap(plates) {
        let totalOceanicArea = 0
        const halfArea = Math.floor(this.#regionTileMap.area / 2)
        const types = new Map()
        plates.forEach(plateId => {
            totalOceanicArea += this.#regionTileMap.getRegionAreaById(plateId)
            const isOceanic = totalOceanicArea < halfArea
            const type = isOceanic ? TYPE_OCEANIC : TYPE_CONTINENTAL
            types.set(plateId, type)
        })
        return types
    }

    get size() {
        return this.#plates.length
    }

    getPlates() {
        return this.#plates
    }

    getSidePlates(plateId) {
        return this.#regionTileMap.getSideRegions(plateId)
    }

    getArea(plateId) {
        return this.#regionTileMap.getRegionAreaById(plateId)
    }

    isOceanic(plateId) {
        return this.#typeMap.get(plateId) === TYPE_OCEANIC
    }

    isContinental(plateId) {
        return this.#typeMap.get(plateId) === TYPE_CONTINENTAL
    }

    isSameType(plate0, plate1) {
        return this.#typeMap.get(plate0) === this.#typeMap.get(plate1)
    }

    forEach(callback) {
        this.#plates.forEach(callback)
    }

    map(callback) {
        this.#plates.map(callback)
    }
}
