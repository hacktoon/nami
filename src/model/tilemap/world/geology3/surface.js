import { SimplexNoise } from '/src/lib/noise'
import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'


const NO_LEVEL = null


export class SurfaceModel {
    #levelMatrix
    #surfaceMatrix
    #noiseMatrix
    #groupMaxLevel

    #buildOrigins(regionTileMap, continentModel) {
        const origins = []
        regionTileMap.forEachBorderPoint((point, sideContinents) => {
            const continent = continentModel.get(point)
            const group = continentModel.getGroup(continent)
            for(let sideContinent of sideContinents) {
                const sideGroup = continentModel.getGroup(sideContinent)
                if (group !== sideGroup) {
                    // select only group borders
                    origins.push(point)
                    break
                }
            }
        })
        return origins
    }

    #buildNoiseMatrix(regionTileMap, continentModel) {
        const noise = new SimplexNoise(5, .8, .04)
        const rect = regionTileMap.rect
        return Matrix.fromRect(rect, point => {
            const continent = continentModel.get(point)
            const group = continentModel.getGroup(continent)
            const offset = Math.pow(group + 1, 2)
            const refPoint = Point.plus(point, [offset, offset])
            return noise.wrappedNoise4D(rect, refPoint)
        })
    }

    #buildLevelMatrix(regionTileMap, continentModel) {
        const origins = this.#buildOrigins(regionTileMap, continentModel)
        const matrix = Matrix.fromRect(regionTileMap.rect, _ => NO_LEVEL)
        new LevelMultiFill(origins, {
            groupMaxLevel: this.#groupMaxLevel,
            area: regionTileMap.rect.area,
            levelMatrix: matrix,
            continentModel,
            regionTileMap,
        }).fill()
        return matrix
    }

    constructor(regionTileMap, continentModel) {
        const rect = regionTileMap.rect
        const groups = continentModel.groups
        this.#groupMaxLevel = new Map(groups.map(group => [group, 0]))
        this.#levelMatrix = this.#buildLevelMatrix(regionTileMap, continentModel)
        this.#noiseMatrix = this.#buildNoiseMatrix(regionTileMap, continentModel)
        this.#surfaceMatrix = Matrix.fromRect(rect, point => {
            const continent = continentModel.get(point)
            const group = continentModel.getGroup(continent)
            const isOceanic = continentModel.isOceanic(continent)
            const maxLevel = this.#groupMaxLevel.get(group)
            const level = this.#levelMatrix.get(point)
            const noise = this.#noiseMatrix.get(point)
            const percentage = (1 * level) / maxLevel
            if (percentage < .1)
                return 20
            if (isOceanic)
                return 0
            else
                return percentage > .6
                    ? noise + 60
                    : noise > 120 ? noise : 40

        })
    }

    get(point) {
        return this.#surfaceMatrix.get(point)
    }

    getLevel(point) {
        return this.#levelMatrix.get(point)
    }

    getNoise(point) {
        return this.#noiseMatrix.get(point)
    }

    isWater(point) {
        return this.get(point) === TYPE_WATER
    }
}


class LevelMultiFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, LevelFloodFill, context)
    }
    getChance(fill, origin) { return .2 }
    getGrowth(fill, origin) { return 8 }
}


class LevelFloodFill extends ConcurrentFillUnit {
    setValue(fill, _point, level) {
        const {regionTileMap, continentModel, groupMaxLevel} = fill.context
        const point = regionTileMap.rect.wrap(_point)
        const continent = continentModel.get(point)
        const group = continentModel.getGroup(continent)
        const currentLevel = groupMaxLevel.get(group)
        if (level > currentLevel) {
            groupMaxLevel.set(group, level)
        }
        fill.context.levelMatrix.set(point, level)
    }

    isEmpty(fill, point) {
        return fill.context.levelMatrix.get(point) === NO_LEVEL
    }

    getNeighbors(fill, point) {
        return Point.adjacents(point)
    }
}
