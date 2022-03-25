import { IndexMap } from '/src/lib/map'
import { Point } from '/src/lib/point'


const TYPE_LAND = 0
const TYPE_OCEAN = 1
const MAX_PLATE_COUNT = 3


export class ContinentModel {
    #regionTileMap
    #typeMap = new Map()
    #plates = []
    #oceanPlates = []
    #landPlates = []
    #plateContinentMap = new Map()
    #continents = []
    #landContinents = []
    #oceanContinents = []

    #buildPlates(regionTileMap) {
        let totalOceanicArea = 0
        const halfArea = Math.floor(regionTileMap.area / 2)
        // sort by bigger to smaller plates
        const cmpDescendingArea = (id0, id1) => {
            const area0 = regionTileMap.getArea(id0)
            const area1 = regionTileMap.getArea(id1)
            return area1 - area0
        }
        const plates = this.#regionTileMap.getRegions().sort(cmpDescendingArea)
        for (let plate of plates) {
            totalOceanicArea += regionTileMap.getArea(plate)
            if (totalOceanicArea < halfArea) {
                this.#typeMap.set(plate, TYPE_OCEAN)
                this.#oceanPlates.push(plate)
            } else {
                this.#typeMap.set(plate, TYPE_LAND)
                this.#landPlates.push(plate)
            }
            this.#plates.push(plate)
        }
    }

    #buildContinents(regionTileMap) {
        const plateQueue = new IndexMap(this.#plates)
        let continentId = 0
        while(plateQueue.size > 0) {
            let totalPlates
            let plateCount = 1
            const plate = plateQueue.random()
            // TODO: order by borderSize
            const cmpDescendingBorderSize = (id0, id1) => {
                const area0 = regionTileMap.getBorderSize(plate, id1)
                const area1 = regionTileMap.getBorderSize(id1, id0)
                return area1 - area0
            }
            const continentType = this.#typeMap.get(plate)
            plateQueue.delete(plate)
            this.#plateContinentMap.set(plate, continentId)
            this.#continents.push(continentId)
            if (continentType === TYPE_OCEAN) {
                totalPlates = this.#oceanPlates.length
                this.#oceanContinents.push(continentId)
            } else {
                totalPlates = this.#landPlates.length
                this.#landContinents.push(continentId)
            }
            const sidePlates = regionTileMap.getSideRegions(plate)

            for (let sidePlate of sidePlates) {
                const notSameType = continentType !== this.#typeMap.get(sidePlate)
                const isMapped = this.#plateContinentMap.has(sidePlate)
                const invalidSize = plateCount >= MAX_PLATE_COUNT
                if (invalidSize || notSameType || isMapped) continue

                this.#plateContinentMap.set(sidePlate, continentId)
                plateQueue.delete(sidePlate)
                plateCount++
            }
            continentId = continentId + 1
        }
    }

    constructor(regionTileMap) {
        this.#regionTileMap = regionTileMap
        this.#buildPlates(regionTileMap)
        this.#buildContinents(regionTileMap)
    }

    get size() {
        return this.#regionTileMap.size
    }

    get ids() {
        return this.#continents
    }

    get landContinents() {
        return this.#landContinents
    }

    get oceanContinents() {
        return this.#oceanContinents
    }

    get plates() {
        return this.#plates
    }

    getPlate(point) {
        return this.#regionTileMap.getRegion(point)
    }

    getArea(continent) {
        return this.#regionTileMap.getArea(continent)
    }

    get(plate) {
        return this.#plateContinentMap.get(plate)
    }

    isOceanic(plate) {
        return this.#typeMap.get(plate) === TYPE_OCEAN
    }

    isBorder(point) {
        return this.#regionTileMap.isBorder(point)
    }

    isOrigin(point) {
        const origin = this.#regionTileMap.getRegionOrigin(point)
        return Point.equals(origin, point)
    }

    forEach(callback) {
        this.#regionTileMap.forEach(callback)
    }

    map(callback) {
        return this.#regionTileMap.map(callback)
    }
}
