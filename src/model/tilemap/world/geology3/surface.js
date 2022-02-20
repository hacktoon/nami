import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { ScanlineFill } from '/src/lib/floodfill/scanline'
import { SimplexNoise } from '/src/lib/fractal/noise'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'


const NO_SURFACE = null
const NO_LEVEL = null


export class SurfaceModel {
    #levelMatrix
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

    #buildSurface(regionTileMap, continentModel) {
        const noise = new SimplexNoise(4, .5, .03)
        for (let group of continentModel.groups) {
            const groupOrigin = continentModel.getGroupOrigin(group)
            const config = new SurfaceFillConfig({
                surfaceMatrix: this.#surfaceMatrix,
                groupMaxLevel: this.#groupMaxLevel,
                levelMatrix: this.#levelMatrix,
                regionTileMap,
                noise,
                group,
            })
            new ScanlineFill(groupOrigin, config).fill()
        }
    }

    constructor(regionTileMap, continentModel) {
        const rect = regionTileMap.rect
        const groups = continentModel.groups
        const origins = this.#buildOrigins(regionTileMap, continentModel)
        this.#groupMaxLevel = new Map(groups.map(group => [group, 0]))
        this.#surfaceMatrix = Matrix.fromRect(rect, _ => NO_SURFACE)
        this.#levelMatrix = Matrix.fromRect(rect, _ => NO_LEVEL)
        new LevelMultiFill(origins, {
            groupMaxLevel: this.#groupMaxLevel,
            levelMatrix: this.#levelMatrix,
            area: regionTileMap.rect.area,
            continentModel,
            regionTileMap,
        }).fill()
        this.#buildSurface(regionTileMap, continentModel)
        // this.#surfaceMatrix = Matrix.fromRect(rect, point => {
        //     const continent = continentModel.get(point)
        //     const group = continentModel.getGroup(continent)
        //     const maxLevel = this.#groupMaxLevel.get(group)
        //     const level = this.#levelMatrix.get(point)
        //     const noise = this.#noiseMatrix.get(point)
        //     return 1
        // })
    }

    getLevel(point) {
        return this.#levelMatrix.get(point)
    }

    getSurface(point) {
        return this.#surfaceMatrix.get(point)
    }

    isWater(point) {
        return this.get(point) === TYPE_WATER
    }
}


class LevelMultiFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, SurfaceFloodFill, context)
    }
    getChance(fill, origin) { return .2 }
    getGrowth(fill, origin) { return 8 }
}


class SurfaceFloodFill extends ConcurrentFillUnit {
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


class SurfaceFillConfig {
    constructor(config) {
        this.surfaceMatrix = config.surfaceMatrix
        this.groupMaxLevel = config.groupMaxLevel
        this.regionTileMap = config.regionTileMap
        this.levelMatrix = config.levelMatrix
        this.group = config.group
        this.noise = config.noise
    }

    canFill(point) {
        return this.surfaceMatrix.get(point) === NO_SURFACE
    }

    onFill(point) {
        const offset = (this.group + 1) * 1000
        const offsetPoint = Point.plus(point, [offset, offset])
        const value = this.noise.get(offsetPoint)
        this.surfaceMatrix.set(point, value)
    }

    filterPoint(point) {
        return this.regionTileMap.rect.wrap(point)
    }
}