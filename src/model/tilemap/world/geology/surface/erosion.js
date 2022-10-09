import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { PairMap } from '/src/lib/map'
import { PointSet } from '/src/lib/point/set'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'

import { Terrain } from './schema'


class ErosionFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        const wrappedPoint = fill.context.rect.wrap(point)
        fill.context.basinMap.set(...wrappedPoint, fill.id)
    }

    isEmpty(fill, point) {
        const wrappedPoint = fill.context.rect.wrap(point)
        const terrainId = fill.context.terrainLayer.get(wrappedPoint)
        const isCurrentTerrain = terrainId == fill.context.currentTerrain
        const isEmpty = ! fill.context.basinMap.has(...wrappedPoint)
        return isCurrentTerrain && isEmpty
    }

    getNeighbors(fill, originPoint) {
        if (originPoint[0] == 98 && originPoint[1] == 15) {
            console.log(Point.around(originPoint));
        }
        return Point.around(originPoint)
    }

    checkNeighbor(fill, sidePoint, centerPoint) {
        const wSidePoint = fill.context.rect.wrap(sidePoint)
        const wCenterPoint = fill.context.rect.wrap(centerPoint)
        const sideTerrain = fill.context.terrainLayer.get(sidePoint)
        const shorePoints = fill.context.shorePoints
        if (fill.context.flowMap.has(...wSidePoint))
            return

        // detect river mouth
        if (shorePoints.has(wCenterPoint) && Terrain.isWater(sideTerrain)) {
            const directionId = this.getDirectionId(centerPoint, sidePoint)
            fill.context.flowMap.set(...wCenterPoint, directionId)
            return
        }
        // set flow only on current terrain layer
        if (sideTerrain === fill.context.currentTerrain) {
            const directionId = this.getDirectionId(sidePoint, centerPoint)
            fill.context.flowMap.set(...wSidePoint, directionId)
        } else {
            //fill.context.nextPoints.add(wSidePoint)
        }
    }

    getDirectionId(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle).id
    }

}


class ErosionMultiFill extends ConcurrentFill {
    constructor(baseContext, terrain) {
        const origins = baseContext.nextPoints.points
        const context = {
            ...baseContext,
            nextPoints: new PointSet(),
            currentTerrain: terrain
        }
        super(origins, ErosionFloodFill, context)
    }

    getChance(fill, origin) { return .2 }
    getGrowth(fill, origin) { return 3 }
}


export class ErosionLayer {
    constructor(terrainLayer, props) {
        const context = {
            nextPoints: props.shorePoints,
            shorePoints: props.shorePoints,
            flowMap: new PairMap(),
            basinMap: new PairMap(),
            rect: props.rect,
            terrainLayer,
        }
        const mapFill = new ErosionMultiFill(context, Terrain.BASIN)

        mapFill.fill()
        this.nextPoints = context.nextPoints
        this.basinMap = context.basinMap
        this.flowMap = context.flowMap
        this.basinCount = props.shorePoints.size
        this.rect = props.rect
    }

    getBasin(point) {
        return this.basinMap.get(...this.rect.wrap(point))
    }

    getErosionDirection(point) {
        const id = this.flowMap.get(...this.rect.wrap(point))
        return Direction.fromId(id)
    }
}

