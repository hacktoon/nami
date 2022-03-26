import { IndexMap } from '/src/lib/map'
import { Point } from '/src/lib/point'


const TYPE_LAND = 0
const TYPE_OCEAN = 1
const MAX_LAND_PLATES = 2


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
        const halfPlates = Math.ceil(this.#plates.length / 2)
        let continentId = 0
        // build continents
        while(this.#plateContinentMap.size <= halfPlates) {
            this.#buildContinent(plateQueue, continentId)
            this.#continents.push(continentId)
            this.#landContinents.push(continentId)
            continentId++
        }
        // build oceans
        while(plateQueue.size > 0) {
            const plate = plateQueue.random()
            plateQueue.delete(plate)
            this.#plateContinentMap.set(plate, continentId)
            this.#typeMap.set(plate, TYPE_OCEAN)
            this.#continents.push(continentId)
            this.#oceanContinents.push(continentId)
            continentId++
        }
    }

    #buildContinent(plateQueue, continentId) {
        let plateCount = 0
        const plate = plateQueue.random()
        const addPlateToContinent = plate => {
            this.#plateContinentMap.set(plate, continentId)
            this.#typeMap.set(plate, TYPE_LAND)
            plateQueue.delete(plate)
            plateCount += 1
        }
        addPlateToContinent(plate)
        for (let sidePlate of this.#getSidePlates(plate)) {
            if (plateCount >= MAX_LAND_PLATES) break
            if (this.#plateContinentMap.has(sidePlate)) continue
            // console.log(plate, sidePlate, plateCount, this.#continents.length);
            addPlateToContinent(sidePlate)
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
