import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { SimplexNoise } from '/src/lib/fractal/noise'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'


const NO_SURFACE = null
const NO_LEVEL = null


export class SurfaceModel {
    #levelMatrix
    #noiseMatrix
    #surfaceMatrix
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

    constructor(regionTileMap, continentModel) {
        const rect = regionTileMap.rect
        const groups = continentModel.groups
        const origins = this.#buildOrigins(regionTileMap, continentModel)
        const noise = new SimplexNoise(4, .5, .03)
        this.#groupMaxLevel = new Map(groups.map(group => [group, 0]))
        this.#noiseMatrix = Matrix.fromRect(rect, _ => NO_SURFACE)
        this.#levelMatrix = Matrix.fromRect(rect, _ => NO_LEVEL)
        new SurfaceMultiFill(origins, {
            groupMaxLevel: this.#groupMaxLevel,
            noiseMatrix: this.#noiseMatrix,
            levelMatrix: this.#levelMatrix,
            area: regionTileMap.rect.area,
            continentModel,
            regionTileMap,
            noise,
        }).fill()
        this.#surfaceMatrix = Matrix.fromRect(rect, point => {
            const continent = continentModel.get(point)
            const group = continentModel.getGroup(continent)
            const maxLevel = this.#groupMaxLevel.get(group)
            const level = this.#levelMatrix.get(point)
            const noise = this.#noiseMatrix.get(point)
            return 1
        })
    }

    getLevel(point) {
        return this.#levelMatrix.get(point)
    }

    getNoise(point) {
        return this.#noiseMatrix.get(point)
    }

    getSurface(point) {
        return this.#surfaceMatrix.get(point)
    }

    isWater(point) {
        return this.get(point) === TYPE_WATER
    }
}


class SurfaceMultiFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, SurfaceFloodFill, context)
    }
    getChance(fill, origin) { return .2 }
    getGrowth(fill, origin) { return 8 }
}


class SurfaceFloodFill extends ConcurrentFillUnit {
    setValue(fill, _point, level) {
        const {regionTileMap, continentModel, groupMaxLevel,noise} = fill.context
        const point = regionTileMap.rect.wrap(_point)
        const continent = continentModel.get(point)
        const group = continentModel.getGroup(continent)
        const ptOffset = (group + 1) * fill.context.area
        const currentLevel = groupMaxLevel.get(group)
        const value = noise.get(Point.plus(point, [ptOffset, ptOffset]))
        if (level > currentLevel) {
            groupMaxLevel.set(group, level)
        }
        fill.context.noiseMatrix.set(point, value)
        fill.context.levelMatrix.set(point, level)
    }

    isEmpty(fill, point) {
        return fill.context.levelMatrix.get(point) === NO_LEVEL
    }

    getNeighbors(fill, point) {
        return Point.adjacents(point)
    }
}
