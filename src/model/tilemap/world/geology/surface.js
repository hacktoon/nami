import { SingleFillUnit } from '/lib/floodfill/single'
import { IndexMap } from '/lib/map'


export class SurfaceModel {
    #surfaces = []
    #plateSurfaceMap = new Map()

    constructor(continentSize, plateModel) {
        const plates = plateModel.getPlates().filter(plate => {
            return plateModel.isContinental(plate)
        })
        const plateQueue = new IndexMap(plates)
        const maxPlateCount = Math.round(plates.length * continentSize)
        const plateCountMap = new Map()
        let surfaceId = 0

        while(plateQueue.size > 0) {
            const plate = plateQueue.random()
            plateCountMap.set(surfaceId, 0)
            this.#surfaces.push(surfaceId)
            new SurfaceFloodFill(plate, {
                plateSurfaceMap: this.#plateSurfaceMap,
                surfaces: this.#surfaces,
                surfaceId: surfaceId++,
                maxPlateCount,
                plateCountMap,
                plateQueue,
                plateModel,
            }).growFull()
        }
        console.log(maxPlateCount, this.#plateSurfaceMap);
    }

    get(plate) {
        return this.#plateSurfaceMap.get(plate)
    }

    getContinents() {
        return this.#surfaces
    }
}


class SurfaceFloodFill extends SingleFillUnit {
    setValue(plate, level) {
        const {surfaceId, plateSurfaceMap, plateCountMap} = this.context
        const plateCount = plateCountMap.get(surfaceId)
        plateSurfaceMap.set(plate, surfaceId)
        plateCountMap.set(surfaceId, plateCount + 1)
        this.context.plateQueue.delete(plate)
    }

    isEmpty(plate) {
        const {plateModel, surfaceId, plateCountMap} = this.context
        const plateCount = plateCountMap.get(surfaceId)
        const isContinental = plateModel.isContinental(plate)
        const notMapped = ! this.context.plateSurfaceMap.has(plate)
        const underCount = plateCount < this.context.maxPlateCount
        return isContinental && notMapped && underCount
    }

    getNeighbors(plate) {
        return this.context.plateModel.getSidePlates(plate)
    }
}
