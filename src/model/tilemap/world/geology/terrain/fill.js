import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
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


class TerrainFloodFill extends ConcurrentFill {
    // override method
    getNeighbors(ref, originPoint) {
        return Point.adjacents(originPoint)
    }

    // override method
    setValue(ref, point, level) {
        const wrappedPoint = this.context.matrix.wrap(point)
        const terrainId = this._getTerrainId(ref, wrappedPoint)
        this.context.matrix.set(wrappedPoint, terrainId)
        // set erosion
        const isBasinSet = this.context.basinMap.has(...wrappedPoint)
        const isLand = this.context.surfaceLayer.isLand(wrappedPoint)
        if (! isBasinSet && isLand)
            this.context.basinMap.set(...wrappedPoint, ref.id)
    }

    // override method
    isEmpty(ref, relSidePoint) {
        const validNoise = this._isValidNoiseThreshold(ref, relSidePoint)
        const isEmpty = this._isCellEmpty(ref, relSidePoint)
        return isEmpty && validNoise
    }

    // override method
    isPhaseEmpty(ref, relSidePoint) {
        const invalidNoise = ! this._isValidNoiseThreshold(ref, relSidePoint)
        const isEmpty = this._isCellEmpty(ref, relSidePoint)
        return isEmpty && invalidNoise
    }

    _isCellEmpty(ref, relSidePoint) {
        const sidePoint = this.context.matrix.wrap(relSidePoint)
        const notWaterBorder = ! this.context.waterBorders.has(sidePoint)
        const notLandBorder = ! this.context.landBorders.has(sidePoint)
        const isEmpty = this.context.matrix.get(relSidePoint) === EMPTY
        return isEmpty && notWaterBorder && notLandBorder
    }

    _isValidNoiseThreshold(ref, sidePoint) {
        const phaseTerrain = Terrain.fromId(ref.fill.phase)
        const OFFSET = 10 * ref.fill.phase
        const point = Point.plus(sidePoint, [OFFSET, OFFSET])
        const noise = this.context.noiseLayer.get(phaseTerrain.noise, point)
        return phaseTerrain.ratio >= noise
    }

    _getTerrainId(ref, point) {
        const isLand = this.context.surfaceLayer.isLand(point)
        let terrainId = ref.fill.phase
        let isDepression = this.context.surfaceLayer.isDepression(point)
        if (isLand && isDepression) {
            // TODO: .lowerTerrain
            const isLowerTerrainLand = Terrain.isLand(terrainId - 1)
            return isLowerTerrainLand ? terrainId - 1 : terrainId
        }
        return terrainId
    }

    // override method
    // check each neighbor to draw water flow map
    checkNeighbor(ref, relSidePoint, relCenterPoint) {
        const centerPoint = this.context.matrix.wrap(relCenterPoint)
        const sidePoint = this.context.matrix.wrap(relSidePoint)
        // only land tiles allowed
        if (this.context.surfaceLayer.isWater(centerPoint)) return

        const isSideWater = this.context.surfaceLayer.isWater(sidePoint)
        const isLandBorder = this.context.landBorders.has(centerPoint)
        // detect river mouth: land border with side water
        if (isLandBorder && isSideWater) {
            const directionId = this._getDirectionId(relCenterPoint, relSidePoint)
            // if (this.context.flowMap.has(...centerPoint)) return
            this.context.flowMap.set(...centerPoint, directionId)
        }

        const isSideLandBorder = this.context.landBorders.has(sidePoint)
        const isFlowSet = this.context.flowMap.has(...sidePoint)
        const directionId = this._getDirectionId(relSidePoint, relCenterPoint)

        // if (centerPoint[0] === 85 && centerPoint[1] === 70) {
        //     console.log(sidePoint, Direction.fromId(directionId));
        //     console.log(this.context.basinMap.get(...sidePoint));
        //     console.log(isFlowSet, isSideWater, isSideLandBorder);
        // }
        if (isFlowSet || isSideWater || isSideLandBorder) return

        this.context.flowMap.set(...sidePoint, directionId)

    }

    _getDirectionId(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle).id
    }
}


export class LandTerrainFill extends TerrainFloodFill {
    constructor(context) {
        const origins = context.landBorders.points
        super(origins, context, LAND_PHASES)
    }
}


export class WaterTerrainFill extends TerrainFloodFill {
    constructor(context) {
        const origins = context.waterBorders.points
        super(origins, context, WATER_PHASES)
    }
}
