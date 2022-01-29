import { IndexMap } from '/lib/map'
import { SingleFillUnit } from '/lib/floodfill/single'


export class ContinentModel {
    #continentArea
    #regionTileMap
    #continentMap = new Map()

    constructor(continentArea, regionTileMap, plateModel) {
        this.#regionTileMap = regionTileMap
        this.#plateModel = plateModel
        this.#continentArea = continentArea

        const plates = plateModel.getPlates().filter(plate => {
            return plateModel.isContinental(plate)
        })
        const plateQueue = new IndexMap(plates)

        const platesPerContinent = Math.floor(plates.length * continentArea)

        while(plateQueue.size > 0) {
            const plate = plateQueue.random()
            plateQueue.delete(plate)
            // const plateId = regionTileMap.getRegion()
            // const context = {
            //     continentMap: this.#continentMap,
            //     plateSet,
            // }
            // new ContinentFloodFill(origins, context).fill()
        }
    }

    get(plate) {

    }
}


class ContinentFloodFill extends SingleFillUnit {
    setValue(regionId, level) {

    }

    isEmpty(regionId) {
        const regionTileMap = this.model.regionTileMap
        const distance = regionTileMap.distanceBetween(this.origin, regionId)
        const insideCircle = distance <= this.model.radius
        return insideCircle && !this.model.filledRegions.has(regionId)
    }

    getNeighbors(regionId) {
        return this.model.regionTileMap.getSideRegions(regionId)
    }
}
