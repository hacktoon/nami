import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'


const NO_SURFACE = null


export class SurfaceModel {
    #regionTileMap
    #matrix

    #buildOrigins(regionTileMap, continentModel) {
        const origins = []
        regionTileMap.forEachBorderPoint((point, sideContinents) => {
            const continent = continentModel.get(point)
            const group = continentModel.getGroup(continent)
            for(let sideContinent of sideContinents) {
                const sideGroup = continentModel.getGroup(sideContinent)
                if (group !== sideGroup) {
                    origins.push(point)
                    break
                }
            }
        })
        return origins
    }

    constructor(regionTileMap, continentModel) {
        this.#regionTileMap = regionTileMap
        this.#matrix = Matrix.fromRect(regionTileMap.rect, _ => NO_SURFACE)
        const origins = this.#buildOrigins(regionTileMap, continentModel)
        new SurfaceMultiFill(origins, {
            regionTileMap,
            matrix: this.#matrix,
        }).fill()
    }

    get(point) {
        return this.#matrix.get(point)
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
        fill.context.matrix.set(point, level)
    }

    isEmpty(fill, point) {
        return fill.context.matrix.get(point) === NO_SURFACE
    }

    getNeighbors(fill, point) {
        return Point.adjacents(point)
    }
}
