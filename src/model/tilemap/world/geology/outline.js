import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { NoiseTileMap } from '/src/model/tilemap/noise'


const NO_LEVEL = null
const WATER = 0
const LAND = 1


export class OutlineModel {
    #outlineMatrix
    #levelMatrix
    #maxLevelMap
    #landArea

    #buildOrigins(regionTileMap, continentModel) {
        const origins = []
        regionTileMap.forEachBorderPoint((point, sidePlates) => {
            const plate = continentModel.getPlate(point)
            const continent = continentModel.get(plate)
            for(let sidePlate of sidePlates) {
                const sideContinent = continentModel.get(sidePlate)
                if (continent !== sideContinent) {
                    origins.push(point)
                    break
                }
            }
        })
        return origins
    }

    #buildNoiseMatrix(rect, seed) {
        return NoiseTileMap.fromData({
            rect: rect.hash(),
            octaves:     5,
            resolution: .8,
            scale:      .1,
            seed: seed,
        })
    }

    #buildLevelMatrix(regionTileMap, continentModel) {
        const rect = regionTileMap.rect
        const origins = this.#buildOrigins(regionTileMap, continentModel)
        const matrix = Matrix.fromRect(rect, _ => NO_LEVEL)
        new LevelMultiFill(origins, {
            maxLevelMap: this.#maxLevelMap,
            area: rect.area,
            levelMatrix: matrix,
            continentModel,
        }).fill()
        return matrix
    }

    #buildOutlineMatrix(seed, regionTileMap, continentModel) {
        const rect = regionTileMap.rect
        const noiseTileMap = this.#buildNoiseMatrix(rect, seed)
        return Matrix.fromRect(rect, point => {
            const noise = noiseTileMap.getNoise(point)
            return this.#buildOutline(continentModel, noise, point)
        })
    }

    #buildOutline(continentModel, noise, point) {
        const plate = continentModel.getPlate(point)
        const isOceanic = continentModel.isOceanic(plate)
        const maxLevel = this.#maxLevelMap.get(plate)
        const level = this.#levelMatrix.get(point)
        const range = (1 * level) / maxLevel
        if (isOceanic) {
            return noise > .75 ? LAND : WATER
        }
        if (range > .3) return LAND
        return noise > .6 ? LAND : WATER
    }

    constructor(seed, regionTileMap, continentModel) {
        this.#landArea = 0
        this.#maxLevelMap = new Map(regionTileMap.map(region => [region, 0]))
        this.#levelMatrix = this.#buildLevelMatrix(regionTileMap, continentModel)
        this.#outlineMatrix = this.#buildOutlineMatrix(
            seed, regionTileMap, continentModel
        )
    }

    get(point) {
        return this.#outlineMatrix.get(point)
    }

    getLevel(point) {
        return this.#levelMatrix.get(point)
    }

    landArea() {
        return this.#landArea
    }

    isLand(point) {
        return this.#outlineMatrix.get(point) === LAND
    }

    isWater(point) {
        return this.#outlineMatrix.get(point) === WATER
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
    setValue(fill, point, level) {
        const {continentModel, levelMatrix, maxLevelMap} = fill.context
        const plate = continentModel.getPlate(point)
        const currentLevel = maxLevelMap.get(plate)
        if (level > currentLevel) {
            maxLevelMap.set(plate, level)
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
