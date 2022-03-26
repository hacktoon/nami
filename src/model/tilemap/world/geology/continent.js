import { IndexMap } from '/src/lib/map'
import { Point } from '/src/lib/point'


const TYPE_LAND = 0
const TYPE_OCEAN = 1
const MAX_LAND_PLATE_COUNT = 2
const MAX_OCEAN_PLATE_COUNT = 6


export class ContinentModel {
    #plateContinentMap = new Map()
    #typeMap = new Map()
    #oceanContinents = []
    #landContinents = []
    #continents = []
    #regionTileMap
    #plates

    #buildContinents() {
        const plateQueue = new IndexMap(this.#plates)
        const halfArea = this.#regionTileMap.area / 2
        const state = {halfArea, continentId: 0, totalArea: 0}
        while(plateQueue.size > 0) {
            const continentId = this.#buildContinent(plateQueue, state)
            this.#continents.push(state.continentId)
            state.continentId = state.continentId + 1
        }
    }

    #buildContinent(plateQueue, state) {
        const plate = plateQueue.random()
        let plateCount = 1
        let maxPlateCount = MAX_LAND_PLATE_COUNT
        let plateType
        const addPlateToContinent = (plate, type) => {
            state.totalArea += this.#regionTileMap.getArea(plate)
            this.#plateContinentMap.set(plate, state.continentId)
            this.#typeMap.set(plate, type)
            plateQueue.delete(plate)
        }
        if (state.totalArea < state.halfArea) {
            plateType = TYPE_LAND
            this.#landContinents.push(state.continentId)
        } else {
            maxPlateCount = MAX_OCEAN_PLATE_COUNT
            plateType = TYPE_OCEAN
            this.#oceanContinents.push(state.continentId)
        }
        addPlateToContinent(plate, plateType)
        for (let sidePlate of this.#getSidePlates(plate)) {
            const isMapped = this.#plateContinentMap.has(sidePlate)
            const invalidSize = plateCount >= maxPlateCount
            if (invalidSize || isMapped) continue
            addPlateToContinent(sidePlate, plateType)
            plateCount++
        }
    }

    #getSidePlates(plate) {
        const sortFunction = (id0, id1) => {
            // descending sort by borderSize
            const border0 = this.#regionTileMap.getBorderSize(plate, id0)
            const border1 = this.#regionTileMap.getBorderSize(plate, id1)
            return border1 - border0
        }
        let x = this.#regionTileMap.getSideRegions(plate).sort(sortFunction)
        // console.log(plate, x);
        return x
    }

    constructor(regionTileMap) {
        this.#regionTileMap = regionTileMap
        this.#plates = regionTileMap.getRegions()
        this.#buildContinents()
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
