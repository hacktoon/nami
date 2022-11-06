import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'

import { Terrain } from '../data'


const PHASES = [
    Terrain.BASIN,
    // Terrain.PLAIN,
    // Terrain.PLATEAU,
    // Terrain.MOUNTAIN,
    // Terrain.PEAK,
]


export class TerrainConcurrentFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, TerrainFloodFill, context, PHASES)
    }

    getChance(ref, origin) { return 1 }
    getGrowth(ref, origin) { return 1 }
}


class TerrainFloodFill extends ConcurrentFillUnit {
    setValue(ref, point, level) {
        const terrain = ref.fill.phase
        const wrappedPoint = ref.context.matrix.rect.wrap(point)
        ref.context.basinMap.set(...wrappedPoint, ref.id)
        ref.context.matrix.set(wrappedPoint, terrain)
    }

    isEmpty(ref, sidePoint) {
        const wSidePoint = ref.context.matrix.rect.wrap(sidePoint)
        const sideTerrainId = ref.context.matrix.get(wSidePoint)
        const isValidTerrainLayer = sideTerrainId <= ref.fill.phase + 1
        const isEmpty = ! ref.context.matrix.has(...wSidePoint)
        const isLand = Terrain.isLand(sideTerrainId)
        return isValidTerrainLayer && isEmpty && isLand
    }

    isPhaseEmpty(ref, sidePoint) {
        return this.isEmpty(ref, sidePoint)
    }

    getNeighbors(ref, originPoint) {
        return Point.adjacents(originPoint)
    }

    checkNeighbor(ref, sidePoint, centerPoint) {
        const wSidePoint = ref.context.matrix.rect.wrap(sidePoint)
        const wCenterPoint = ref.context.matrix.rect.wrap(centerPoint)
        const sideTerrainId = ref.context.matrix.get(sidePoint)
        const landBorders = ref.context.landBorders
        const isSideWater = Terrain.isWater(sideTerrainId)
        // detect river mouth
        if (landBorders.has(wCenterPoint) && isSideWater) {
            const directionId = this.getDirectionId(centerPoint, sidePoint)
            ref.context.flowMap.set(...wCenterPoint, directionId)
            return
        }
        if (ref.context.flowMap.has(...wSidePoint) || isSideWater) {
            return
        }

        // set flow only on current or lower terrain layer
        if (sideTerrainId <= ref.fill.phase + 1) {
            const directionId = this.getDirectionId(sidePoint, centerPoint)
            ref.context.flowMap.set(...wSidePoint, directionId)
        }
    }

    getDirectionId(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle).id
    }
}
