import { Random } from '/src/lib/random'
import { PairMap } from '/src/lib/map'
import { Point } from '/src/lib/point'


export class BoundaryModel {
    #regionTileMap

    #buildOrigins(regionTileMap) {
        const origins = []
        regionTileMap.forEachBorderPoint((point, sidePlates) => {
            const plate = continentModel.getPlate(point)

        })
        return origins
    }

    constructor(regionTileMap) {
        this.#regionTileMap = regionTileMap
    }
}
