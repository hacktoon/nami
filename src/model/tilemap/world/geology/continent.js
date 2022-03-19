import { SingleFillUnit } from '/src/lib/floodfill/single'
import { IndexMap } from '/src/lib/map'
import { Point } from '/src/lib/point'


const TYPE_LAND = 0
const TYPE_OCEAN = 1


export class ContinentModel {
    #regionTileMap
    #typeMap = new Map()
    #plates = []
    #plateContinentMap = new Map()
    #continents = []

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
            const isOceanic = totalOceanicArea < halfArea
            this.#typeMap.set(plate, isOceanic ? TYPE_OCEAN : TYPE_LAND)
            this.#plates.push(plate)
        }
    }

    #buildContinents(params, regionTileMap) {
        const continentScale = params.get('continentScale')
        const plateQueue = new IndexMap(this.#plates)
        const maxContinentSize = Math.round(this.#plates.length * continentScale)
        const continentSizeMap = new Map()
        let continentId = 0
        while(plateQueue.size > 0) {
            const plate = plateQueue.random()
            continentSizeMap.set(continentId, 0)
            this.#continents.push(continentId)
            new ContinentFloodFill(plate, {
                plateContinentMap: this.#plateContinentMap,
                typeMap: this.#typeMap,
                continentId: continentId++,
                plateQueue,
                maxContinentSize,
                continentSizeMap,
                regionTileMap,
            }).growFull()
        }
    }

    constructor(params, regionTileMap) {
        this.#regionTileMap = regionTileMap
        this.#buildPlates(regionTileMap)
        this.#buildContinents(params, regionTileMap)
    }

    get size() {
        return this.#regionTileMap.size
    }

    get ids() {
        return this.#continents
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


class ContinentFloodFill extends SingleFillUnit {
    setValue(plate, level) {
        const {continentId, continentSizeMap} = this.context
        const currentContinentSize = continentSizeMap.get(continentId)
        this.context.plateContinentMap.set(plate, continentId)
        this.context.plateQueue.delete(plate)
        continentSizeMap.set(continentId, currentContinentSize + 1)
    }

    isEmpty(plate) {
        const {typeMap, continentId, continentSizeMap} = this.context
        const currentContinentSize = continentSizeMap.get(continentId)
        const sameType = typeMap.get(this.origin) === typeMap.get(plate)
        const noContinent = ! this.context.plateContinentMap.has(plate)
        const validSize = currentContinentSize <= this.context.maxContinentSize
        return sameType && noContinent && validSize
    }

    getNeighbors(plate) {
        const regionTileMap = this.context.regionTileMap
        return regionTileMap.getSideRegions(plate)
    }
}
