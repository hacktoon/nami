import { SingleFillUnit } from '/lib/floodfill/single'


export class ContinentModel {
    #continentArea
    #regionTileMap
    #continentMap = new Map()

    constructor(continentArea, regionTileMap, plateModel) {
        this.#regionTileMap = regionTileMap
        this.#plateModel = plateModel
        this.#continentArea = continentArea

        const plates = plateModel.getPlates()
        const plateSet = new Set(plates)

        const platesPerContinent = Math.floor(plates.length * continentArea)
        let availablePlates = plates.length

        while(plateSet.size > 0) {
            const region = regionTileMap.getRegion()
            const fill = new SingleFillUnit()
            availablePlates -= platesPerContinent
        }

        // const context = {
        //     continentMap: this.#continentMap,
        //     plateSet,
        // }
        // new ContinentConcurrentFill(origins, context).fill()
    }

    get(plate) {

    }

}
