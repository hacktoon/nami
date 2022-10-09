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
            fill.context.flowMap.set(...wCenterPoint, wSidePoint)
            return
        }
        // set flow only on current terrain layer
        if (sideTerrain === fill.context.currentTerrain) {
            fill.context.flowMap.set(...wSidePoint, wCenterPoint)
        } else {
            //fill.context.nextPoints.add(wSidePoint)
        }
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

    getFlowTarget(point) {
        return this.flowMap.get(...this.rect.wrap(point))
    }
}

