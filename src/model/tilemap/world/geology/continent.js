import { IndexMap } from '/src/lib/map'
import { Point } from '/src/lib/point'


const TYPE_LAND = 0
const TYPE_OCEAN = 1
const MAX_PLATE_COUNT = 3


export class ContinentModel {
    #plateContinentMap = new Map()
    #typeMap = new Map()
    #oceanContinents = []
    #landContinents = []
    #continents = []
    #regionTileMap
    #plates

    #buildContinents(regionTileMap) {
        const plateQueue = new IndexMap(this.#plates)
        const state = {
            halfArea: Math.floor(regionTileMap.area / 2),
            continentId: 0,
            totalArea: 0,
            regionTileMap,
        }
        while(plateQueue.size > 0) {
            this.#buildContinent(plateQueue, state)
        }
        console.log(this.#typeMap);
    }

    #buildContinent(plateQueue, state) {
        const plate = plateQueue.random()
        let plateCount = 1
        let plateType
        if (state.totalArea < state.halfArea) {
            plateType = TYPE_LAND
            this.#landContinents.push(state.continentId)
        } else {
            plateType = TYPE_OCEAN
            this.#oceanContinents.push(state.continentId)
        }
        state.totalArea += state.regionTileMap.getArea(plate)
        this.#plateContinentMap.set(plate, state.continentId)
        this.#continents.push(state.continentId)
        this.#typeMap.set(plate, plateType)
        plateQueue.delete(plate)
        const sidePlates = this.#getSidePlates(state.regionTileMap, plate)
        for (let sidePlate of sidePlates) {
            const isMapped = this.#plateContinentMap.has(sidePlate)
            const invalidSize = plateCount >= MAX_PLATE_COUNT
            if (invalidSize || isMapped) continue
            this.#plateContinentMap.set(sidePlate, state.continentId)
            this.#typeMap.set(sidePlate, plateType)
            state.totalArea += state.regionTileMap.getArea(sidePlate)
            plateQueue.delete(sidePlate)
            plateCount++
        }
        state.continentId = state.continentId + 1
    }

    #getSidePlates(regionTileMap, plate) {
        const sortFunction = (id0, id1) => {
            // descending sort by borderSize
            const border0 = regionTileMap.getBorderSize(plate, id0)
            const border1 = regionTileMap.getBorderSize(plate, id1)
            return border1 - border0
        }
        let x = regionTileMap.getSideRegions(plate).sort(sortFunction)
        // console.log(plate, x);
        return x
    }

    constructor(regionTileMap) {
        this.#regionTileMap = regionTileMap
        this.#plates = regionTileMap.getRegions()
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
