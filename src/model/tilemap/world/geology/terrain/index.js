import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PairMap } from '/src/lib/map'
import { PointSet } from '/src/lib/point/set'

import { Terrain } from '../data'


const EMPTY = null

const PHASES = [
    Terrain.BASIN,
    Terrain.PLAIN,
    Terrain.PLATEAU,
    Terrain.MOUNTAIN
]

export class TerrainLayer {
    #landBorders = new PointSet()
    #waterBorders = new PointSet()
    #basinMap = new PairMap()
    #flowMap = new PairMap()
    #noiseLayer
    #surfaceLayer
    #matrix

    constructor(noiseLayer, surfaceLayer) {
        this.#noiseLayer = noiseLayer
        this.#surfaceLayer = surfaceLayer
        this.#matrix = this.#buildLayer(noiseLayer.rect)
    }

    #buildLayer(rect) {
        const matrix = Matrix.fromRect(rect, point => {
            this.#detectBorders(point)
            return EMPTY
        })
        const context = {
            surfaceLayer: this.#surfaceLayer,
            landBorders: this.#landBorders,
            waterBorders: this.#waterBorders,
            noiseLayer: this.#noiseLayer,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
            matrix: matrix
        }
        const origins = this.#landBorders.points
        new TerrainConcurrentFill(origins, context).fill()
        return matrix
    }

    #detectBorders(point) {
        const isWater = this.#surfaceLayer.isWater(point)
        for (let sidePoint of Point.adjacents(point)) {
            const isSideWater = this.#surfaceLayer.isWater(sidePoint)
            if (isWater) {
                if (! isSideWater) {
                    this.#waterBorders.add(point)
                    break
                }
            } else {
                if (isSideWater) {
                    this.#landBorders.add(point)
                    break
                }
            }
        }
    }

    get(point) {
        const id = this.#matrix.get(point)
        return Terrain.fromId(id)
    }

    isLandBorder(point) {
        return this.#landBorders.has(point)
    }

    isWaterBorder(point) {
        return this.#waterBorders.has(point)
    }
}



export class TerrainConcurrentFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, TerrainFloodFill, context, PHASES)
    }

    getChance(ref, origin) { return 0 }
    getGrowth(ref, origin) { return 1 }
}


class TerrainFloodFill extends ConcurrentFillUnit {
    setValue(ref, point, level) {
        const terrainId = ref.fill.phase
        const wrappedPoint = ref.context.matrix.wrap(point)
        ref.context.basinMap.set(...wrappedPoint, ref.id)
        ref.context.matrix.set(wrappedPoint, terrainId)
    }

    isEmpty(ref, relativeSidePoint) {
        const isCurrentTerrain = this._isCurrentTerrain(ref, relativeSidePoint)
        const isEmpty = this._checkIsEmpty(ref, relativeSidePoint)
        return isEmpty && isCurrentTerrain
    }

    isPhaseEmpty(ref, relativeSidePoint) {
        const isDifferentTerrain = ! this._isCurrentTerrain(ref, relativeSidePoint)
        const isEmpty = this._checkIsEmpty(ref, relativeSidePoint)
        return isEmpty && isDifferentTerrain
    }

    _checkIsEmpty(ref, relativeSidePoint) {
        const sidePoint = ref.context.matrix.wrap(relativeSidePoint)
        const notBorder = ! this._isBorder(ref, sidePoint)
        const isEmpty = ref.context.matrix.get(sidePoint) === EMPTY
        const isLand = ref.context.surfaceLayer.isLand(sidePoint)
        return isEmpty && isLand && notBorder
    }

    _isBorder(ref, point) {
        return ref.context.waterBorders.has(point)
            || ref.context.landBorders.has(point)
    }

    _isCurrentTerrain(ref, sidePoint) {
        const OFFSET = 10 * ref.fill.phase
        const phaseTerrain = Terrain.fromId(ref.fill.phase)
        const offsetPoint = Point.plus(sidePoint, [OFFSET, OFFSET])
        const point = ref.context.matrix.wrap(offsetPoint)
        const noise = ref.context.noiseLayer.get(phaseTerrain.noise, point)
        return phaseTerrain.ratio >= noise
    }

    getNeighbors(ref, originPoint) {
        return Point.adjacents(originPoint)
    }

    // checkNeighbor(ref, sidePoint, centerPoint) {
    //     const wSidePoint = ref.context.matrix.wrap(sidePoint)
    //     const wCenterPoint = ref.context.matrix.wrap(centerPoint)
    //     const sideTerrainId = ref.context.matrix.get(sidePoint)
    //     const isSideWater = ref.context.surfaceLayer.isWater(wSidePoint)
    //     // detect river mouth
    //     if (ref.context.borders.has(wCenterPoint) && isSideWater) {
    //         const directionId = this.getDirectionId(centerPoint, sidePoint)
    //         ref.context.flowMap.set(...wCenterPoint, directionId)
    //         return
    //     }
    //     if (ref.context.flowMap.has(...wSidePoint) || isSideWater) {
    //         return
    //     }

    //     // set flow only on current or lower terrain layer
    //     if (sideTerrainId <= ref.fill.phase + 1) {
    //         const directionId = this.getDirectionId(sidePoint, centerPoint)
    //         ref.context.flowMap.set(...wSidePoint, directionId)
    //     }
    // }

    getDirectionId(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle).id
    }
}
