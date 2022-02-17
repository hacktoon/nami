import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/point'


export class SurfaceModel {
    #regionTileMap

    #buildOrigins(regionTileMap, continentModel) {
        const origins = []
        regionTileMap.forEachBorderPoint((point, sideRegions) => {
            origins.push(point)
        })
        return origins
    }

    constructor(regionTileMap, continentModel) {
        this.#regionTileMap = regionTileMap
        const origins = this.#buildOrigins(regionTileMap, continentModel)
        new SurfaceMultiFill(origins, {
            regionTileMap
        })
    }

    get(point) {
        return this.#regionTileMap.getRegion(point)
    }
}


class SurfaceMultiFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, SurfaceFloodFill, context)
    }

    getChance(fill, origin) {
        return this.context.chance
    }

    getGrowth(fill, origin) {
        return this.context.growth
    }
}


class SurfaceFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {

    }

    isEmpty(fill, point) {

    }

    getNeighbors(fill, point) {
        return Point.adjacents(point)
    }
}
