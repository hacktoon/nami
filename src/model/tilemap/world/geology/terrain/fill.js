import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { PairMap } from '/src/lib/map'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'

import { Terrain } from '../data'


class ErosionFloodFill extends ConcurrentFillUnit {
    setValue(ref, point, level) {
        const wrappedPoint = ref.context.rect.wrap(point)
        ref.context.basinMap.set(...wrappedPoint, ref.id)
    }

    isEmpty(ref, sidePoint) {
        const wSidePoint = ref.context.rect.wrap(sidePoint)
        const sideTerrainId = ref.context.terrainLayer.get(wSidePoint)
        const isValidTerrainLayer = sideTerrainId <= ref.fill.phase + 1
        const isEmpty = ! ref.context.basinMap.has(...wSidePoint)
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
        const wSidePoint = ref.context.rect.wrap(sidePoint)
        const wCenterPoint = ref.context.rect.wrap(centerPoint)
        const sideTerrainId = ref.context.terrainLayer.get(sidePoint)
        const shorePoints = ref.context.shorePoints
        const isSideWater = Terrain.isWater(sideTerrainId)
        // detect river mouth
        if (shorePoints.has(wCenterPoint) && isSideWater) {
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


class ErosionConcurrentFill extends ConcurrentFill {
    constructor(origins, context, phases) {
        super(origins, ErosionFloodFill, context, phases)
    }

    getChance(ref, origin) { return .2 }
    getGrowth(ref, origin) { return 3 }
}
