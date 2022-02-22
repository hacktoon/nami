import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { SingleFillUnit } from '/src/lib/floodfill/single'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { NoiseTileMap } from '/src/model/tilemap/noise'


const NO_SURFACE = null
const NO_LEVEL = null


export class SurfaceModel {
    #levelMatrix
    #surfaceMatrix
    #noiseMatrix
    #groupMaxLevel
    #noiseLevel

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

    #buildNoise(regionTileMap, continentModel) {
        const noiseTileMap = NoiseTileMap.fromData({
            rect: regionTileMap.rect.hash(),
            seed: this.seed,
            detail: 4,
            resolution: .5,
            scale: .03
        })
        for (let group of continentModel.groups) {
            const groupOrigin = continentModel.getGroupOrigin(group)
            new NoiseFloodFill(groupOrigin, {
                noiseMatrix: this.#noiseMatrix,
                groupMaxLevel: this.#groupMaxLevel,
                levelMatrix: this.#levelMatrix,
                noiseLevel: this.#noiseLevel,
                continentModel,
                noiseTileMap,
                group,
            }).growFull()
        }
    }

    constructor(regionTileMap, continentModel) {
        const rect = regionTileMap.rect
        const groups = continentModel.groups
        const origins = this.#buildOrigins(regionTileMap, continentModel)
        this.#groupMaxLevel = new Map(groups.map(group => [group, 0]))
        this.#noiseMatrix = Matrix.fromRect(rect, _ => NO_SURFACE)
        this.#levelMatrix = Matrix.fromRect(rect, _ => NO_LEVEL)
        this.#noiseLevel = Matrix.fromRect(rect, _ => NO_LEVEL)
        new LevelMultiFill(origins, {
            groupMaxLevel: this.#groupMaxLevel,
            levelMatrix: this.#levelMatrix,
            area: regionTileMap.rect.area,
            continentModel,
            regionTileMap,
        }).fill()
        this.#buildNoise(regionTileMap, continentModel)
        this.#surfaceMatrix = Matrix.fromRect(rect, point => {
            const continent = continentModel.get(point)
            const group = continentModel.getGroup(continent)
            const maxLevel = this.#groupMaxLevel.get(group)
            const level = this.#levelMatrix.get(point)
            const noise = this.#noiseMatrix.get(point)
            if (continentModel.isOceanic(continent))
                return 1
                return level > 10 ? noise : 1
        })
    }

    get(point) {
        return this.#surfaceMatrix.get(point)
    }

    getLevel(point) {
        return this.#levelMatrix.get(point)
    }

    getNoiseLevel(point) {
        return this.#noiseLevel.get(point)
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


/**
 * Fills the groups
 */
 class NoiseFloodFill extends SingleFillUnit {
    setValue(point, level) {
        const {noiseTileMap, group} = this.context
        const offset = Math.pow(group + 1, 2)
        const refPoint = Point.plus(point, [offset, offset])
        const value = noiseTileMap.get(refPoint)
        // if (refPoint[0]==144 && refPoint[1]==46) {
        //     console.log('lower', value);
        // }
        this.context.noiseLevel.set(point, level)
        this.context.noiseMatrix.set(point, value)
    }

    isEmpty(point) {
        const {continentModel, noiseMatrix} = this.context
        const continent = continentModel.get(point)
        const group = continentModel.getGroup(continent)
        const surface = noiseMatrix.get(point)
        return surface === NO_SURFACE && this.context.group === group
    }

    getNeighbors(point) {
        return Point.adjacents(point)
    }
}
