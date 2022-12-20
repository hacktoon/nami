import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Point } from '/src/lib/point'

import { Terrain } from './data'


const LAND_PHASES = [
    Terrain.BASIN,
    Terrain.PLAIN,
    Terrain.PLATEAU,
    Terrain.MOUNTAIN
]

const WATER_PHASES = [
    Terrain.SEA,
    Terrain.OCEAN,
    Terrain.ABYSS
]

const EMPTY = null


export class LandTerrainConcurrentFill extends ConcurrentFill {
    constructor(context) {
        const origins = context.landBorders.points
        super(origins, TerrainFloodFill, context, LAND_PHASES)
    }
}


export class WaterTerrainConcurrentFill extends ConcurrentFill {
    constructor(context) {
        const origins = context.waterBorders.points
        super(origins, TerrainFloodFill, context, WATER_PHASES)
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
        if (ref.context.surfaceLayer.isLand(wrappedPoint))
            ref.context.basinMap.set(...wrappedPoint, ref.id)
    }

    isEmpty(ref, relSidePoint) {
        const validNoise = this._isValidNoiseThreshold(ref, relSidePoint)
        const isEmpty = this._isCellEmpty(ref, relSidePoint)
        return isEmpty && validNoise
    }

    isPhaseEmpty(ref, relSidePoint) {
        const invalidNoise = ! this._isValidNoiseThreshold(ref, relSidePoint)
        const isEmpty = this._isCellEmpty(ref, relSidePoint)
        return isEmpty && invalidNoise
    }

    _isCellEmpty(ref, relSidePoint) {
        const sidePoint = ref.context.matrix.wrap(relSidePoint)
        const notWaterBorder = ! ref.context.waterBorders.has(sidePoint)
        const notLandBorder = ! ref.context.landBorders.has(sidePoint)
        const isEmpty = ref.context.matrix.get(relSidePoint) === EMPTY
        return isEmpty && notWaterBorder && notLandBorder
    }

    _isValidNoiseThreshold(ref, sidePoint) {
        const phaseTerrain = Terrain.fromId(ref.fill.phase)
        const OFFSET = 10 * ref.fill.phase
        const point = Point.plus(sidePoint, [OFFSET, OFFSET])
        const noise = ref.context.noiseLayer.get(phaseTerrain.noise, point)
        return phaseTerrain.ratio >= noise
    }

    _getTerrainId(ref, point) {
        const isLand = ref.context.surfaceLayer.isLand(point)
        let terrainId = ref.fill.phase
        if (isLand) {
            if (ref.context.surfaceLayer.isDepression(point)) {
                const isLowerTerrainLand = Terrain.isLand(terrainId - 1)
                return isLowerTerrainLand ? terrainId - 1 : terrainId
            }
        }
        return terrainId
    }

    checkNeighbor(ref, relSidePoint, relCenterPoint) {
        const sidePoint = ref.context.matrix.wrap(relSidePoint)
        const centerPoint = ref.context.matrix.wrap(relCenterPoint)
        // check land tiles only to draw flow map
        if (ref.context.surfaceLayer.isWater(centerPoint)) return

        const isSideWater = ref.context.surfaceLayer.isWater(sidePoint)
        // detect river mouth: land border with side water
        if (ref.context.landBorders.has(centerPoint) && isSideWater) {
            const directionId = this._getDirectionId(relCenterPoint, relSidePoint)
            ref.context.flowMap.set(...centerPoint, directionId)
            return
        }
        // center pt is water: if side is water, do nothing
        if (ref.context.flowMap.has(...sidePoint) || isSideWater) {
            return
        }
        const sideTerrainId = ref.context.matrix.get(relSidePoint)
        // set flow only on current or lower terrain layer
        if (sideTerrainId <= ref.fill.phase + 1) {
            const directionId = this._getDirectionId(relSidePoint, relCenterPoint)
            ref.context.flowMap.set(...sidePoint, directionId)
        }
    }

    _getDirectionId(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle).id
    }
}
