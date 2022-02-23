import { SimplexNoise } from '/src/lib/noise'
import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'


const NO_LEVEL = null


export class SurfaceModel {
    #levelMatrix
    #surfaceMatrix
    #maxLevel

    #buildOrigins(regionTileMap, continentModel) {
        const origins = []
        regionTileMap.forEachBorderPoint((point, sideContinents) => {
            const continent = continentModel.get(point)
            for(let sideContinent of sideContinents) {
                continentModel.isOceanic()
                if (continent !== sideContinent) {
                    origins.push(point)
                    break
                }
            }
        })
        return origins
    }

    #buildLevelMatrix(regionTileMap, continentModel) {
        const origins = this.#buildOrigins(regionTileMap, continentModel)
        const matrix = Matrix.fromRect(regionTileMap.rect, _ => NO_LEVEL)
        new LevelMultiFill(origins, {
            maxLevel: this.#maxLevel,
            area: regionTileMap.rect.area,
            levelMatrix: matrix,
            continentModel,
        }).fill()
        return matrix
    }

    constructor(regionTileMap, continentModel) {
        const rect = regionTileMap.rect
        const contSimplex = new SimplexNoise(4, .8, .06)
        this.#maxLevel = new Map(regionTileMap.map(region => [region, 0]))
        this.#levelMatrix = this.#buildLevelMatrix(regionTileMap, continentModel)
        this.#surfaceMatrix = Matrix.fromRect(rect, point => {
            const continent = continentModel.get(point)
            const isOceanic = continentModel.isOceanic(continent)
            const maxLevel = this.#maxLevel.get(continent)
            const level = this.#levelMatrix.get(point)
            const noise = contSimplex.wrappedNoise4D(rect, point)
            const percentage = (1 * level) / maxLevel
            if (isOceanic) {
                if (percentage > .4) return noise > 100 ? 0 : 20
                if (percentage > .3) return noise > 100 ? 0 : 20
                if (percentage > .2) return noise > 120 ? 20 : 40
                if (percentage > .1) return noise > 120 ? 40 : 60
                return 60
            } else {
                if (percentage > .2) return noise > 100 ? 100 : 80
                if (percentage > .1) return noise > 100 ? 80 : 60
                return 60
            }


        })
    }

    get(point) {
        return this.#surfaceMatrix.get(point)
    }

    getLevel(point) {
        return this.#levelMatrix.get(point)
    }

    isWater(point) {
        return this.get(point) === TYPE_WATER
    }
}


class LevelMultiFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, LevelFloodFill, context)
    }
    getChance(fill, origin) { return .1 }
    getGrowth(fill, origin) { return 10 }
}


class LevelFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        const {continentModel, levelMatrix, maxLevel} = fill.context
        const continent = continentModel.get(point)
        const currentLevel = maxLevel.get(continent)
        if (level > currentLevel) {
            maxLevel.set(continent, level)
        }
        levelMatrix.set(point, level)
    }

    isEmpty(fill, point) {
        return fill.context.levelMatrix.get(point) === NO_LEVEL
    }

    getNeighbors(fill, point) {
        return Point.adjacents(point)
    }
}
