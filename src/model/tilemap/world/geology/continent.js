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
        const config = {
            halfArea: Math.floor(regionTileMap.area / 2),
            continentId: 0,
            totalArea: 0,
            regionTileMap,
        }
        while(plateQueue.size > 0) {
            this.#buildContinent(plateQueue, config)
        }
    }

    #buildContinent(plateQueue, config) {
        const plate = plateQueue.random()
        let plateCount = 1
        plateQueue.delete(plate)
        config.totalArea += config.regionTileMap.getArea(plate)
        this.#plateContinentMap.set(plate, config.continentId)
        this.#continents.push(config.continentId)
        if (config.totalArea <= config.halfArea) {
            this.#typeMap.set(plate, TYPE_LAND)
            this.#landContinents.push(config.continentId)
        } else {
            this.#typeMap.set(plate, TYPE_OCEAN)
            this.#oceanContinents.push(config.continentId)
        }
        const sidePlates = this.#getSidePlates(config.regionTileMap, plate)
        for (let sidePlate of sidePlates) {
            const isMapped = this.#plateContinentMap.has(sidePlate)
            const invalidSize = plateCount >= MAX_PLATE_COUNT
            if (invalidSize || isMapped) continue
            const sidePlateArea = config.regionTileMap.getArea(sidePlate)
            this.#plateContinentMap.set(sidePlate, config.continentId)
            if (plate == 1) {
                console.log("plate: ", plate);
                console.log(
                    "sidePlate: ", sidePlate,
                    "continent: ", config.continentId
                );
            }
            config.totalArea += sidePlateArea
            plateQueue.delete(sidePlate)
            plateCount++
        }
        config.continentId = config.continentId + 1
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
