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
        const isBasinSet = ref.context.basinMap.has(...wrappedPoint)
        const isLand = ref.context.surfaceLayer.isLand(wrappedPoint)
        if (! isBasinSet && isLand)
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
                // TODO: .lowerTerrain
                const isLowerTerrainLand = Terrain.isLand(terrainId - 1)
                return isLowerTerrainLand ? terrainId - 1 : terrainId
            }
        }
        return terrainId
    }

    // check each neighbor to draw water flow map
    checkNeighbor(ref, relSidePoint, relCenterPoint) {
        const centerPoint = ref.context.matrix.wrap(relCenterPoint)
        const sidePoint = ref.context.matrix.wrap(relSidePoint)
        // only land tiles allowed
        if (ref.context.surfaceLayer.isWater(centerPoint)) return

        const isSideWater = ref.context.surfaceLayer.isWater(sidePoint)
        const isLandBorder = ref.context.landBorders.has(centerPoint)
        // detect river mouth: land border with side water
        if (isLandBorder && isSideWater) {
            const directionId = this._getDirectionId(relCenterPoint, relSidePoint)
            // if (ref.context.flowMap.has(...centerPoint)) return
            ref.context.flowMap.set(...centerPoint, directionId)
        }

        const isSideLandBorder = ref.context.landBorders.has(sidePoint)
        const isFlowSet = ref.context.flowMap.has(...sidePoint)
        const directionId = this._getDirectionId(relSidePoint, relCenterPoint)

        // if (centerPoint[0] === 85 && centerPoint[1] === 70) {
        //     console.log(sidePoint, Direction.fromId(directionId));
        //     console.log(ref.context.basinMap.get(...sidePoint));
        //     console.log(isFlowSet, isSideWater, isSideLandBorder);
        // }
        if (isFlowSet || isSideWater || isSideLandBorder) return

        ref.context.flowMap.set(...sidePoint, directionId)

    }

    _getDirectionId(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle).id
    }
}
