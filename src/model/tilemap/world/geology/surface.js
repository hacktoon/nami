import { SingleFillUnit } from '/lib/floodfill/single'
import { IndexMap } from '/lib/map'


const TYPE_CONTINENT = 0
const TYPE_OCEAN = 1


export class SurfaceModel {
    #continents = []
    #oceans = []
    #plateSurfaceMap = new Map()
    #surfaceTypeMap = new Map()

    constructor(surfaceSize, plateModel) {
        const plates = plateModel.getPlates()
        const plateQueue = new IndexMap(plates)
        const maxPlateCount = Math.round(plates.length * surfaceSize)
        const plateCountMap = new Map()
        let surfaceId = 0
        while(plateQueue.size > 0) {
            const plate = plateQueue.random()
            const surfaceType = this._buildType(plateModel, surfaceId, plate)
            plateCountMap.set(surfaceId, 0)
            this.#surfaceTypeMap.set(surfaceId, surfaceType)
            new SurfaceFloodFill(plate, {
                plateSurfaceMap: this.#plateSurfaceMap,
                surfaceId: surfaceId++,
                maxPlateCount,
                plateCountMap,
                plateQueue,
                plateModel,
            }).growFull()
        }
    }

    _buildType(plateModel, surfaceId, plate) {
        if (plateModel.isContinental(plate)) {
            this.#continents.push(surfaceId)
            return TYPE_CONTINENT
        }
        this.#oceans.push(surfaceId)
        return TYPE_OCEAN
    }

    get(plate) {
        return this.#plateSurfaceMap.get(plate)
    }

    isContinent(plate) {
        const surface = this.get(plate)
        return this.#surfaceTypeMap.get(surface) === TYPE_CONTINENT
    }

    getSurfaces() {
        return this.#continents.concat(this.#oceans)
    }

    getContinents() {
        return this.#continents
    }

    getOceans() {
        return this.#oceans
    }
}


class SurfaceFloodFill extends SingleFillUnit {
    setValue(plate, level) {
        const {surfaceId, plateCountMap} = this.context
        const plateCount = plateCountMap.get(surfaceId)
        this.context.plateSurfaceMap.set(plate, surfaceId)
        this.context.plateQueue.delete(plate)
        plateCountMap.set(surfaceId, plateCount + 1)
    }

    isEmpty(plate) {
        const {plateModel, surfaceId, plateCountMap} = this.context
        const plateCount = plateCountMap.get(surfaceId)
        const isSameType = plateModel.isSameType(this.origin, plate)
        const notMapped = ! this.context.plateSurfaceMap.has(plate)
        const underCount = plateCount < this.context.maxPlateCount
        return isSameType && notMapped && underCount
    }

    getNeighbors(plate) {
        return this.context.plateModel.getSidePlates(plate)
    }
}
