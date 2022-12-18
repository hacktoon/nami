import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Point } from '/src/lib/point'
import { clamp } from '/src/lib/number'

import { Terrain } from './data'

const PHASES = [
    Terrain.BASIN,
    Terrain.PLAIN,
    Terrain.PLATEAU,
    Terrain.MOUNTAIN
]
const EMPTY = null


export class TerrainConcurrentFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, TerrainFloodFill, context, PHASES)
    }
}


class TerrainFloodFill extends ConcurrentFillUnit {
    getNeighbors(ref, originPoint) {
        return Point.adjacents(originPoint)
    }

    setValue(ref, point, level) {
        const wrappedPoint = ref.context.matrix.wrap(point)
        const terrainId = this._getTerrainId(ref, wrappedPoint)
        ref.context.matrix.set(wrappedPoint, terrainId)
        // set erosion
        ref.context.basinMap.set(...wrappedPoint, ref.id)
    }

    isEmpty(ref, relSidePoint) {
        const samePhase = this._isNoiseOnCurrentPhase(ref, relSidePoint)
        const isEmpty = this._isCellEmpty(ref, relSidePoint)
        return isEmpty && samePhase
    }

    isPhaseEmpty(ref, relSidePoint) {
        const notSamePhase = ! this._isNoiseOnCurrentPhase(ref, relSidePoint)
        const isEmpty = this._isCellEmpty(ref, relSidePoint)
        return isEmpty && notSamePhase
    }

    _isCellEmpty(ref, relSidePoint) {
        // isStateEqual(p1, p2)
        const isLand = ref.context.surfaceLayer.isLand(relSidePoint)
        const isEmpty = ref.context.matrix.get(relSidePoint) === EMPTY
        const isTerrainType = isLand
        return isEmpty && isTerrainType
    }

    _isNoiseOnCurrentPhase(ref, sidePoint) {
        const phaseTerrain = Terrain.fromId(ref.fill.phase)
        const OFFSET = 10 * ref.fill.phase
        const point = Point.plus(sidePoint, [OFFSET, OFFSET])
        const noise = ref.context.noiseLayer.get(phaseTerrain.noise, point)
        return phaseTerrain.ratio >= noise
    }

    _getTerrainId(ref, point) {
        const isDepression = ref.context.surfaceLayer.isDepression(point)
        const terrainId = isDepression ? ref.fill.phase - 1 : ref.fill.phase
        return clamp(terrainId, Terrain.BASIN, Terrain.MOUNTAIN)
    }

    // checkNeighbor(ref, sidePoint, centerPoint) {
    //     const wSidePoint = ref.context.matrix.wrap(sidePoint)
    //     const wCenterPoint = ref.context.matrix.wrap(centerPoint)
    //     const sideTerrainId = ref.context.matrix.get(sidePoint)
    //     const isSideWater = ref.context.surfaceLayer.isWater(wSidePoint)
    //     // detect river mouth
    //     if (ref.context.borders.has(wCenterPoint) && isSideWater) {
    //         const directionId = this._getDirectionId(centerPoint, sidePoint)
    //         ref.context.flowMap.set(...wCenterPoint, directionId)
    //         return
    //     }
    //     if (ref.context.flowMap.has(...wSidePoint) || isSideWater) {
    //         return
    //     }

    //     // set flow only on current or lower terrain layer
    //     if (sideTerrainId <= ref.fill.phase + 1) {
    //         const directionId = this._getDirectionId(sidePoint, centerPoint)
    //         ref.context.flowMap.set(...wSidePoint, directionId)
    //     }
    // }

    _getDirectionId(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle).id
    }
}
