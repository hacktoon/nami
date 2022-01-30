import { IndexMap } from '/lib/map'
import { SingleFillUnit } from '/lib/floodfill/single'


export class ContinentModel {
    #continents = []
    #continentMap = new Map()

    constructor(continentSize, plateModel) {
        const plates = plateModel.getPlates().filter(plate => {
            return plateModel.isContinental(plate)
        })
        const plateQueue = new IndexMap(plates)
        const maxPlateCount = Math.floor(plates.length * continentSize)
        const plateCountMap = new Map()
        let continentId = 0

        while(plateQueue.size > 0) {
            const plate = plateQueue.random()
            plateCountMap.set(continentId, 0)
            this.#continents.push(continentId)
            new ContinentFloodFill(plate, {
                continentMap: this.#continentMap,
                continents: this.#continents,
                continentId: continentId++,
                maxPlateCount,
                plateQueue,
                plateModel,
                plateCountMap,
            }).growFull()
        }
    }

    get(plate) {
        return this.#continentMap.get(plate)
    }

    getContinents() {
        return this.#continents
    }
}


class ContinentFloodFill extends SingleFillUnit {
    setValue(plate, level) {
        const {continentId, continentMap, plateCountMap} = this.context
        const plateCount = plateCountMap.get(continentId)
        continentMap.set(plate, continentId)
        plateCountMap.set(continentId, plateCount + 1)
        this.context.plateQueue.delete(plate)
    }

    isEmpty(plate) {
        const {plateModel, continentId, plateCountMap} = this.context
        const plateCount = plateCountMap.get(continentId)
        const isContinental = plateModel.isContinental(plate)
        const notMapped = ! this.context.continentMap.has(plate)
        const underCount = plateCount < this.context.maxPlateCount
        return isContinental && notMapped && underCount
    }

    getNeighbors(plate) {
        return this.context.plateModel.getSidePlates(plate)
    }
}
